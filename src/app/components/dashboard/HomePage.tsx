import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DollarSign, Leaf, Gauge, Scale, Activity, Truck, Battery } from 'lucide-react';
import { mockKPIData, mockVehicles } from '@/app/data/mockData';
import { useLanguage } from '@/app/i18n/LanguageContext';
import { Button } from '@/app/components/ui/button';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/skeleton';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  isRTL?: boolean;
}

function KPICard({ title, value, unit, icon, trend, color, isRTL }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1">
          <p className={`text-sm text-gray-600 mb-1 ${isRTL ? 'text-right' : ''}`}>{title}</p>
          <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className="text-3xl font-semibold text-gray-900">{value}</h3>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {trend && <p className={`text-xs text-gray-500 mt-2 ${isRTL ? 'text-right' : ''}`}>{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const activeVehicles = mockVehicles.filter(v => v.status === 'on-route').length;
  const idleVehicles = mockVehicles.filter(v => v.status === 'idle').length;
  const delayedVehicles = mockVehicles.filter(v => v.status === 'delayed').length;
  const fleetIsEmpty = mockVehicles.length === 0;

  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateReport = () => {
    toast(t('home.reportComingSoon'));
  };

  return (
    <div className={`p-8 ${isRTL ? 'text-right' : ''}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{t('home.title')}</h1>
        <p className="text-gray-600">{t('home.subtitle')}</p>
      </div>

      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Activity className="w-5 h-5 text-green-700" />
          <span className="text-sm font-medium text-green-900">{t('home.liveConnected')}</span>
        </div>
        <span className="text-sm text-green-700 ml-auto">
          {t('home.lastUpdated')}: {new Date().toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))
        ) : (
          <>
            <KPICard title={t('home.totalCost')} value={mockKPIData.totalCost.toLocaleString()} unit="SAR"
              icon={<DollarSign className="w-6 h-6 text-blue-700" />} trend={t('home.trendCost')} color="bg-blue-100" isRTL={isRTL} />
            <KPICard title={t('home.co2Emissions')} value={mockKPIData.co2Emissions.toLocaleString()} unit="kg"
              icon={<Leaf className="w-6 h-6 text-green-700" />} trend={t('home.trendCO2')} color="bg-green-100" isRTL={isRTL} />
            <KPICard title={t('home.fleetUtilization')} value={mockKPIData.fleetUtilization} unit="%"
              icon={<Gauge className="w-6 h-6 text-purple-700" />} trend={t('home.trendUtil')} color="bg-purple-100" isRTL={isRTL} />
            <KPICard title={t('home.workloadFairness')} value={mockKPIData.workloadFairness.toFixed(2)}
              icon={<Scale className="w-6 h-6 text-amber-700" />} trend={t('home.trendTarget')} color="bg-amber-100" isRTL={isRTL} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('home.fleetStatus')}</h2>
          {fleetIsEmpty ? (
            <EmptyState
              icon={Truck}
              title={t('home.empty.fleetTitle')}
              description={t('home.empty.fleetDesc')}
            />
          ) : (
          <div className="space-y-4">
            {[
              { label: t('home.onRoute'), sub: t('home.activeDeliveries'), count: activeVehicles, bg: 'bg-green-100', color: 'text-green-700' },
              { label: t('home.idle'), sub: t('home.availableDispatch'), count: idleVehicles, bg: 'bg-gray-100', color: 'text-gray-700' },
              { label: t('home.delayed'), sub: t('home.requiresAttention'), count: delayedVehicles, bg: 'bg-red-100', color: 'text-red-700' },
            ].map((item) => (
              <div key={item.label} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                    <Truck className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.sub}</p>
                  </div>
                </div>
                <span className="text-2xl font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('home.vehicleTypes')}</h2>
          <div className="space-y-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-700" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm font-medium text-gray-900">{t('home.iceTrucks')}</p>
                  <p className="text-xs text-gray-500">{t('home.conventionalFleet')}</p>
                </div>
              </div>
              <span className="text-2xl font-semibold text-gray-900">{mockVehicles.filter(v => v.type === 'truck').length}</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Battery className="w-5 h-5 text-green-700" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm font-medium text-gray-900">{t('home.electricVehicles')}</p>
                  <p className="text-xs text-gray-500">{t('home.zeroEmission')}</p>
                </div>
              </div>
              <span className="text-2xl font-semibold text-gray-900">{mockVehicles.filter(v => v.type === 'ev').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('home.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/optimization')}
            className="transition-colors duration-150"
          >
            {t('home.runOptimization')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/fleet')}
            className="transition-colors duration-150"
          >
            {t('home.viewFleetMap')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleGenerateReport}
            className="transition-colors duration-150"
          >
            {t('home.generateReport')}
          </Button>
        </div>
      </div>
    </div>
  );
}
