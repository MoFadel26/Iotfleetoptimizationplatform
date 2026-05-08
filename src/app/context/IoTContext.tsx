import React, { createContext, useContext, useState, useCallback } from 'react';
import { useIoTDevice } from '@/app/hooks/useIoTDevice';
import { useDisruptionDetector, Disruption } from '@/app/hooks/useDisruptionDetector';
import { IoTPayload } from '@/app/simulation/mockIoTDevice';

interface IoTContextType {
  iotData: IoTPayload | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  consecutiveFailures: number;

  disruptions: Disruption[];
  isRecalculating: boolean;
  recalcTimeMs: number | null;
  systemReliability: number;
  acknowledgeDisruption: (id: string) => void;

  hasRecalculated: boolean;
  setHasRecalculated: (v: boolean) => void;

  manualRecalcTick: number;
  triggerManualRecalc: () => void;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export function useIoT(): IoTContextType {
  const ctx = useContext(IoTContext);
  if (!ctx) throw new Error('useIoT must be used inside IoTProvider');
  return ctx;
}

export function IoTProvider({ children }: { children: React.ReactNode }) {
  const { data, isConnected, lastUpdated, consecutiveFailures } = useIoTDevice();
  const {
    disruptions,
    isRecalculating,
    recalcTimeMs,
    systemReliability,
    acknowledgeDisruption,
  } = useDisruptionDetector(data);

  const [hasRecalculated, setHasRecalculated] = useState<boolean>(false);
  const [manualRecalcTick, setManualRecalcTick] = useState<number>(0);

  const triggerManualRecalc = useCallback(() => {
    setManualRecalcTick(t => t + 1);
  }, []);

  const value: IoTContextType = {
    iotData: data,
    isConnected,
    lastUpdated,
    consecutiveFailures,

    disruptions,
    isRecalculating,
    recalcTimeMs,
    systemReliability,
    acknowledgeDisruption,

    hasRecalculated,
    setHasRecalculated,

    manualRecalcTick,
    triggerManualRecalc,
  };

  return <IoTContext.Provider value={value}>{children}</IoTContext.Provider>;
}
