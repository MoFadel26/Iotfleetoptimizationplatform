import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';
import { MapPin, CheckCircle2, Clock, AlertTriangle, Package, Inbox } from 'lucide-react';
import { useLanguage } from '@/app/i18n/LanguageContext';
import { useIoT } from '@/app/context/IoTContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { fetchStreetRoute, fetchAlternateStreetRoute, type LatLng } from '@/app/utils/streetRouting';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// ── Types ─────────────────────────────────────────────────────────────────────

type StopStatus = 'completed' | 'current' | 'upcoming' | 'final';

interface RouteStop {
  id: number;
  name: string;
  lat: number;
  lon: number;
  status: StopStatus;
}

interface FleetRouteResponse {
  depot: { name: string; lat: number; lon: number };
  vehicles: Array<{
    id: string;
    name: string;
    vehicle_type: string;
    stops: RouteStop[];
    distance_km: number;
    idle: boolean;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function motionArrow(motion: string): string {
  if (motion === 'ACCELERATING') return '↑';
  if (motion === 'DECELERATING') return '↓';
  if (motion === 'STOPPED') return '■';
  return '→';
}

function stopDotIcon(status: StopStatus, label: number): L.DivIcon {
  if (status === 'completed') {
    return L.divIcon({
      className: '',
      html: `<div style="width:22px;height:22px;border-radius:50%;background:#9ca3af;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">✓</div>`,
      iconSize: [22, 22], iconAnchor: [11, 11],
    });
  }
  if (status === 'current') {
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:34px;height:34px;"><span style="position:absolute;inset:0;border-radius:50%;background:rgba(37,99,235,.35);animation:stopPulse 1.6s ease-out infinite;"></span><span style="position:absolute;inset:7px;background:#2563eb;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);"></span></div>`,
      iconSize: [34, 34], iconAnchor: [17, 17],
    });
  }
  if (status === 'final') {
    return L.divIcon({
      className: '',
      html: `<div style="display:flex;flex-direction:column;align-items:center;"><div style="background:#dc2626;color:#fff;border-radius:50%;width:32px;height:32px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;">★</div><div style="background:#dc2626;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-top:2px;white-space:nowrap;">Final</div></div>`,
      iconSize: [64, 48], iconAnchor: [32, 40],
    });
  }
  return L.divIcon({
    className: '',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid #2563eb;box-shadow:0 1px 3px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;color:#1d4ed8;font-size:11px;font-weight:700;">${label}</div>`,
    iconSize: [24, 24], iconAnchor: [12, 12],
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RouteNavigationPage() {
  const { t, isRTL } = useLanguage();
  const {
    iotData: data,
    isConnected,
    isRecalculating,
    recalcTimeMs,
    hasRecalculated,
    setHasRecalculated,
  } = useIoT();

  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [deliveredIds, setDeliveredIds] = useState<Set<number>>(new Set());
  const [delayDialogOpen, setDelayDialogOpen] = useState(false);
  const [delayReason, setDelayReason] = useState('traffic');
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [depotName, setDepotName] = useState('Depot');
  const [depotLat, setDepotLat] = useState(24.7136);
  const [depotLon, setDepotLon] = useState(46.6753);
  const [routesLoading, setRoutesLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.CircleMarker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const prevPathRef = useRef<LatLng[] | null>(null);
  const prevIsRecalcRef = useRef(false);
  const routingTokenRef = useRef(0);
  const activeStopsRef = useRef<RouteStop[]>([]);

  // Fetch EV-02's route from MongoDB via Flask
  useEffect(() => {
    fetch('/optimizer/fleet-routes')
      .then(r => r.json())
      .then((d: FleetRouteResponse) => {
        const activeVehicle = d.vehicles.find(v => !v.idle);
        if (activeVehicle) {
          setStops(activeVehicle.stops);
          activeStopsRef.current = activeVehicle.stops;
        }
        setDepotName(d.depot.name);
        setDepotLat(d.depot.lat);
        setDepotLon(d.depot.lon);
      })
      .catch(() => {})
      .finally(() => setRoutesLoading(false));
  }, []);

  const currentStop = stops[currentStopIndex] ?? null;

  const handleMarkDelivered = () => {
    if (!currentStop) return;
    setDeliveredIds(prev => new Set(prev).add(currentStop.id));
    toast.success(t('nav2.deliveredToast'));
    if (currentStopIndex < stops.length - 1) setCurrentStopIndex(i => i + 1);
  };

  const handleSubmitDelay = () => {
    setDelayDialogOpen(false);
    toast.success(t('nav2.delayReportedToast'));
  };

  const computeRoute = useCallback(async (lat: number, lon: number, asRecalc: boolean) => {
    if (!mapRef.current) return;
    const token = ++routingTokenRef.current;
    const remaining = activeStopsRef.current.filter(s => !deliveredIds.has(s.id));
    const waypoints: LatLng[] = [[lat, lon], ...remaining.map(s => [s.lat, s.lon] as LatLng)];

    const path = asRecalc
      ? await fetchAlternateStreetRoute(waypoints, prevPathRef.current, 5)
      : await fetchStreetRoute(waypoints);

    if (token !== routingTokenRef.current || !mapRef.current) return;

    const prev = routePolylineRef.current;
    if (prev) { prev.setStyle({ opacity: 0 }); setTimeout(() => prev.remove(), 500); }

    routePolylineRef.current = L.polyline(path, {
      color: asRecalc ? '#f59e0b' : '#2563eb',
      weight: 4, opacity: 0.9,
      dashArray: asRecalc ? '10 8' : undefined,
      lineJoin: 'round', lineCap: 'round',
    }).addTo(mapRef.current);

    prevPathRef.current = path;
    if (asRecalc) setHasRecalculated(true);
  }, [setHasRecalculated, deliveredIds]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false })
      .setView([depotLat, depotLon], 13);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    const marker = L.circleMarker([depotLat, depotLon], {
      radius: 12, fillColor: '#2563eb', color: '#1d4ed8', weight: 3, fillOpacity: 0.95,
    }).addTo(map).bindPopup('EV-02');
    vehicleMarkerRef.current = marker;
    return () => {
      map.remove();
      mapRef.current = null;
      vehicleMarkerRef.current = null;
      routePolylineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw stop markers and route once stops are loaded
  useEffect(() => {
    if (!mapRef.current || stops.length === 0) return;
    const map = mapRef.current;

    // Clear old markers
    stopMarkersRef.current.forEach(m => m.remove());
    stopMarkersRef.current = [];

    // Draw stop markers
    let upcomingCount = 0;
    stops.forEach(stop => {
      const label = stop.status === 'upcoming' ? ++upcomingCount : 0;
      const marker = L.marker([stop.lat, stop.lon], {
        icon: stopDotIcon(stop.status, label), keyboard: false,
      }).addTo(map).bindTooltip(stop.name, { direction: 'top', offset: [0, -8] });
      stopMarkersRef.current.push(marker);
    });

    computeRoute(
      data?.lat ?? depotLat,
      data?.lon ?? depotLon,
      false
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);

  // Follow vehicle
  useEffect(() => {
    if (!data?.gps_fix || !vehicleMarkerRef.current || !mapRef.current) return;
    vehicleMarkerRef.current.setLatLng([data.lat, data.lon]);
    mapRef.current.setView([data.lat, data.lon], undefined, { animate: true });
  }, [data]);

  // Auto recalc
  useEffect(() => {
    const was = prevIsRecalcRef.current;
    prevIsRecalcRef.current = isRecalculating;
    if (!was || isRecalculating) return;
    computeRoute(data?.lat ?? depotLat, data?.lon ?? depotLon, true);
  }, [isRecalculating, data, computeRoute, depotLat, depotLon]);

  const speedColor = !data ? 'text-gray-500' :
    data.speed > 90 ? 'text-red-600' :
    data.speed >= 60 ? 'text-amber-600' : 'text-green-600';

  const tempBadge = !data ? '' :
    data.temp_status === 'TOO HOT' ? 'bg-red-100 text-red-700' :
    data.temp_status === 'WARM' ? 'bg-amber-100 text-amber-700' :
    'bg-green-100 text-green-700';

  const statusLabel = (s: StopStatus) => {
    if (s === 'completed') return t('nav2.completed');
    if (s === 'current')   return t('nav2.current');
    if (s === 'final')     return 'Final';
    return t('nav2.upcoming');
  };

  return (
    <div className="h-full flex flex-col">

      {/* MAP */}
      <div className="relative isolate flex-shrink-0 h-[240px] landscape:h-[180px]">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {routesLoading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow px-3 py-1 rounded text-xs text-gray-600 flex items-center gap-2" style={{ zIndex: 1000 }}>
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading Riyadh route…
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white/95 border border-gray-200 shadow-md rounded-md px-2 py-1.5 text-[10px] text-gray-700" style={{ zIndex: 1000 }}>
          <div className="font-semibold text-gray-900 mb-0.5">{t('fleet.legend.title')}</div>
          <div className="flex items-center gap-1 mb-0.5">
            <svg width="18" height="5"><line x1="0" y1="2.5" x2="18" y2="2.5" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" /></svg>
            <span className={hasRecalculated ? 'text-gray-400' : ''}>{t('fleet.legend.original')}</span>
          </div>
          {hasRecalculated && (
            <div className="flex items-center gap-1">
              <svg width="18" height="5"><line x1="0" y1="2.5" x2="18" y2="2.5" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 3" /></svg>
              <span className="font-semibold text-amber-700">{t('fleet.legend.recalc')}</span>
            </div>
          )}
        </div>
      </div>

      {/* LIVE STATS */}
      {data && (
        <div className={`flex items-center gap-3 px-3 py-2 bg-gray-900 text-white text-xs flex-shrink-0 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="flex items-center gap-1 font-bold text-green-400 min-w-[60px]">● {t('iot.liveIndicator')}</span>
          <span className="text-gray-400">|</span>
          <span className={`font-semibold min-w-[60px] ${speedColor}`}>{data.speed.toFixed(1)} km/h</span>
          <span className="text-gray-400">|</span>
          <span className="font-medium">{motionArrow(data.motion)} {data.motion}</span>
          <span className="text-gray-400">|</span>
          <span className="flex items-center gap-1">
            {data.temp.toFixed(1)}°C
            <span className={`px-1 py-0.5 rounded text-xs font-semibold ${tempBadge}`}>{data.temp_status}</span>
          </span>
          <span className="text-gray-400">|</span>
          <span>🛰 {data.satellites}</span>
        </div>
      )}

      {/* DISRUPTION BANNER */}
      {isRecalculating && (
        <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex-shrink-0 flex items-center gap-2">
          ⚡ {t('iot.recalculating')}
          {recalcTimeMs !== null && <span className="text-amber-100 text-xs">{(recalcTimeMs / 1000).toFixed(1)}s</span>}
        </div>
      )}
      {!isConnected && (
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-xs text-gray-600 flex-shrink-0">
          📡 {t('iot.lastKnown')}
        </div>
      )}

      {/* Current stop detail */}
      {currentStop && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className={`flex items-start gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-blue-700" />
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{currentStop.name}</h3>
              <div className={`flex items-center gap-3 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Package className="w-4 h-4" />
                  <span>{t('nav2.packages')}</span>
                </div>
                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="w-4 h-4" />
                  <span>{t('nav2.eta')}: —</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={handleMarkDelivered} disabled={deliveredIds.has(currentStop.id)}
              className={`w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CheckCircle2 className="w-5 h-5" />
              {deliveredIds.has(currentStop.id) ? t('nav2.completed') : t('nav2.markDelivered')}
            </button>
            <button onClick={() => setDelayDialogOpen(true)}
              className={`w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertTriangle className="w-5 h-5" />
              {t('route.reportDelay')}
            </button>
          </div>
        </div>
      )}

      {/* Stops list */}
      <div className="bg-white border-t border-gray-200 flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className={`text-sm font-semibold text-gray-900 mb-1 ${isRTL ? 'text-right' : ''}`}>
            {depotName}
          </h3>
          <p className="text-xs text-gray-400 mb-3">{stops.length} stops · OSRM road routing</p>
          {stops.length === 0 ? (
            <EmptyState icon={Inbox} title={t('nav2.empty.title')} description={t('nav2.empty.desc')} />
          ) : (
            <div className="space-y-2">
              {stops.map((stop, index) => {
                const isDone = deliveredIds.has(stop.id);
                const isCurrent = index === currentStopIndex;
                const effectiveStatus: StopStatus = isDone ? 'completed' : isCurrent ? 'current' : stop.status;
                return (
                  <button key={stop.id} onClick={() => setCurrentStopIndex(index)}
                    className={`w-full ${isRTL ? 'text-right' : 'text-left'} p-3 rounded-lg border transition-colors ${
                      isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        effectiveStatus === 'completed' ? 'bg-gray-400 text-white' :
                        effectiveStatus === 'current'   ? 'bg-blue-600 text-white' :
                        effectiveStatus === 'final'     ? 'bg-red-600 text-white'  :
                        'bg-white border-2 border-blue-500 text-blue-700'
                      }`}>
                        {effectiveStatus === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                         effectiveStatus === 'final' ? '★' : index + 1}
                      </div>
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                        <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>{stop.name}</p>
                        <p className="text-xs text-gray-500">{stop.lat.toFixed(4)}, {stop.lon.toFixed(4)}</p>
                      </div>
                      {(isCurrent || effectiveStatus === 'final') && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          effectiveStatus === 'final' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>{statusLabel(effectiveStatus)}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delay dialog */}
      <Dialog open={delayDialogOpen} onOpenChange={setDelayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('route.reportDelay')}</DialogTitle>
            <DialogDescription>{t('nav2.delayDialogDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="delay-reason" className="text-sm font-medium text-foreground">{t('nav2.delayReason')}</label>
            <select id="delay-reason" value={delayReason} onChange={e => setDelayReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
              <option value="traffic">{t('nav2.delayReason.traffic')}</option>
              <option value="weather">{t('nav2.delayReason.weather')}</option>
              <option value="vehicle">{t('nav2.delayReason.vehicle')}</option>
              <option value="customer">{t('nav2.delayReason.customer')}</option>
              <option value="other">{t('nav2.delayReason.other')}</option>
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">{t('common.cancel')}</Button></DialogClose>
            <Button variant="default" onClick={handleSubmitDelay}>{t('common.submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
