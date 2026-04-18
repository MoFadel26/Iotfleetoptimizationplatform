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
import { DriverHomePage } from '@/app/components/mobile/DriverHomePage';
import { RouteNavigationPage } from '@/app/components/mobile/RouteNavigationPage';
import { VehicleStatusPage } from '@/app/components/mobile/VehicleStatusPage';
import { NotificationsPage } from '@/app/components/mobile/NotificationsPage';
import { ProfilePage } from '@/app/components/mobile/ProfilePage';
import { LanguageProvider, useLanguage, type Language } from '@/app/i18n/LanguageContext';

function DashboardLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {(['en', 'ar'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            language === lang
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {lang === 'en' ? 'EN' : 'عر'}
        </button>
      ))}
    </div>
  );
}

function AppInner() {
  const [viewMode, setViewMode] = React.useState<'web' | 'mobile'>('web');
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setViewMode('web')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              viewMode === 'web'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('app.webDashboard')}
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              viewMode === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('app.mobileApp')}
          </button>
          {viewMode === 'web' && <DashboardLanguageSwitcher />}
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
      <Router>
        <AppInner />
      </Router>
    </LanguageProvider>
  );
}
