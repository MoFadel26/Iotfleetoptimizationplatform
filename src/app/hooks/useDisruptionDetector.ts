import { useState, useRef, useCallback, useEffect } from 'react';
import { IoTPayload } from '@/app/simulation/mockIoTDevice';

export interface Disruption {
  id: string;
  type: 'unexpected_stop' | 'gps_signal_lost' | 'temperature_alert' | 'traffic_slowdown';
  detectedAt: Date;
  resolvedAt: Date | null;
  severity: 'low' | 'medium' | 'high';
  vehicleId: string;
  description: string;
}

interface DisruptionDetectorResult {
  disruptions: Disruption[];
  isRecalculating: boolean;
  recalcTimeMs: number | null;
  systemReliability: number;
  acknowledgeDisruption: (id: string) => void;
}

function computeReliability(disruptions: Disruption[]): number {
  const unresolved = disruptions.filter(d => d.resolvedAt === null);
  let score = 99.5;
  for (const d of unresolved) {
    if (d.severity === 'high') score -= 1.5;
    else if (d.severity === 'medium') score -= 0.8;
    else score -= 0.3;
  }
  return Math.min(99.9, Math.max(85.0, Math.round(score * 10) / 10));
}

function hasUnresolved(disruptions: Disruption[], type: Disruption['type']): boolean {
  return disruptions.some(d => d.type === type && d.resolvedAt === null);
}

export function useDisruptionDetector(payload: IoTPayload | null): DisruptionDetectorResult {
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcTimeMs, setRecalcTimeMs] = useState<number | null>(null);

  const prevPayloadRef = useRef<IoTPayload | null>(null);
  const gpsLostCountRef = useRef(0);
  const decelCountRef = useRef(0);

  const triggerRecalc = useCallback(() => {
    setIsRecalculating(true);
    const start = Date.now();
    const delay = 3000 + Math.random() * 5000;
    setTimeout(() => {
      setIsRecalculating(false);
      setRecalcTimeMs(Date.now() - start);
    }, delay);
  }, []);

  const addDisruption = useCallback((
    disruption: Omit<Disruption, 'id' | 'detectedAt' | 'resolvedAt'>,
    current: Disruption[]
  ): Disruption[] => {
    if (hasUnresolved(current, disruption.type)) return current;
    const newD: Disruption = {
      ...disruption,
      id: `${disruption.type}-${Date.now()}`,
      detectedAt: new Date(),
      resolvedAt: null,
    };
    triggerRecalc();
    return [newD, ...current];
  }, [triggerRecalc]);

  // Detection runs in an effect (not inline) so setDisruptions never fires during render — required under React 18 Concurrent Mode / StrictMode.
  useEffect(() => {
    if (payload !== null && payload !== prevPayloadRef.current) {
      const prev = prevPayloadRef.current;

      setDisruptions(current => {
        let next = current;

        // GPS lost tracking
        if (!payload.gps_fix) {
          gpsLostCountRef.current += 1;
        } else {
          gpsLostCountRef.current = 0;
        }

        // Decel tracking
        if (payload.motion === 'DECELERATING' && payload.speed < 15) {
          decelCountRef.current += 1;
        } else {
          decelCountRef.current = 0;
        }

        // 1. Unexpected stop
        if (payload.motion === 'STOPPED' && payload.speed < 2 && prev && prev.motion !== 'STOPPED') {
          next = addDisruption({
            type: 'unexpected_stop',
            severity: 'high',
            vehicleId: 'EV-02',
            description: 'Vehicle EV-02 stopped unexpectedly',
          }, next);
        }

        // 2. GPS signal lost (2+ consecutive)
        if (gpsLostCountRef.current >= 2) {
          next = addDisruption({
            type: 'gps_signal_lost',
            severity: 'medium',
            vehicleId: 'EV-02',
            description: 'GPS signal lost on vehicle EV-02',
          }, next);
        }

        // 3. Temperature alert
        if (payload.temp_status === 'TOO HOT') {
          next = addDisruption({
            type: 'temperature_alert',
            severity: 'high',
            vehicleId: 'EV-02',
            description: 'Cargo temperature critical on EV-02',
          }, next);
        }

        // 4. Traffic slowdown (3+ consecutive decel + speed < 15)
        if (decelCountRef.current >= 3) {
          next = addDisruption({
            type: 'traffic_slowdown',
            severity: 'low',
            vehicleId: 'EV-02',
            description: 'Traffic slowdown detected on EV-02 route',
          }, next);
        }

        return next;
      });

      prevPayloadRef.current = payload;
    }
  }, [payload, addDisruption]);

  const acknowledgeDisruption = useCallback((id: string) => {
    setDisruptions(prev =>
      prev.map(d => d.id === id ? { ...d, resolvedAt: new Date() } : d)
    );
  }, []);

  return {
    disruptions,
    isRecalculating,
    recalcTimeMs,
    systemReliability: computeReliability(disruptions),
    acknowledgeDisruption,
  };
}
