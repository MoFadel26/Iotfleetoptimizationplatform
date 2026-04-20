import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/app/components/dashboard/DashboardLayout';
import { MobileLayout } from '@/app/components/mobile/MobileLayout';
import { HomePage } from '@/app/components/dashboard/HomePage';
import { LiveFleetMapPage } from '@/app/components/dashboard/LiveFleetMapPage';
import { RouteOptimizationPage } from '@/app/components/dashboard/RouteOptimizationPage';
import { AnalyticsPage } from '@/app/components/dashboard/AnalyticsPage';
import { SettingsPage } from '@/app/components/dashboard/SettingsPage';
import { CompliancePage } from '@/app/components/dashboard/CompliancePage';
import { RouteTestPage } from '@/app/components/dashboard/RouteTestPage';
import { DriverHomePage } from '@/app/components/mobile/DriverHomePage';
import { RouteNavigationPage } from '@/app/components/mobile/RouteNavigationPage';
import { VehicleStatusPage } from '@/app/components/mobile/VehicleStatusPage';
import { NotificationsPage } from '@/app/components/mobile/NotificationsPage';
import { ProfilePage } from '@/app/components/mobile/ProfilePage';
import { LanguageProvider, useLanguage } from '@/app/i18n/LanguageContext';
import { IoTProvider } from '@/app/context/IoTContext';
import { Toaster } from '@/app/components/ui/sonner';

function AppInner() {
  const [viewMode, setViewMode] = React.useState<'web' | 'mobile'>('web');
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform switcher — bottom-left */}
      <div className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setViewMode('web')}
            aria-label={t('app.webDashboard')}
            aria-pressed={viewMode === 'web'}
            className={`px-4 py-2 rounded text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              viewMode === 'web'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
          >
            {t('app.webDashboard')}
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            aria-label={t('app.mobileApp')}
            aria-pressed={viewMode === 'mobile'}
            className={`px-4 py-2 rounded text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              viewMode === 'mobile'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
          >
            {t('app.mobileApp')}
          </button>
        </div>
      </div>

      {viewMode === 'web' ? (
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="fleet" element={<LiveFleetMapPage />} />
            <Route path="optimization" element={<RouteOptimizationPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="test" element={<RouteTestPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<MobileLayout />}>
            <Route index element={<DriverHomePage />} />
            <Route path="navigation" element={<RouteNavigationPage />} />
            <Route path="vehicle" element={<VehicleStatusPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <IoTProvider>
        <Router>
          <AppInner />
          <Toaster position="top-right" richColors closeButton />
        </Router>
      </IoTProvider>
    </LanguageProvider>
  );
}
