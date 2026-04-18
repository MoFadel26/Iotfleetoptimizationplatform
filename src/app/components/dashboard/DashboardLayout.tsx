import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Route, BarChart3, Settings, Truck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/app/i18n/LanguageContext';

export function DashboardLayout() {
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.overview') },
    { path: '/fleet', icon: Map, label: t('nav.liveFleet') },
    { path: '/optimization', icon: Route, label: t('nav.optimization') },
    { path: '/analytics', icon: BarChart3, label: t('nav.analytics') },
    { path: '/compliance', icon: ShieldCheck, label: t('nav.compliance') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`flex h-screen bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Sidebar */}
      <aside className={`w-64 bg-white flex flex-col ${isRTL ? 'border-l border-gray-200' : 'border-r border-gray-200'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <h1 className="text-lg font-semibold text-gray-900">FleetIoT</h1>
              <p className="text-xs text-gray-500">Saudi Arabia</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isRTL ? 'flex-row-reverse' : ''
                } ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className={`text-xs text-gray-500 ${isRTL ? 'text-right' : ''}`}>
            <p>{t('nav.portal')}</p>
            <p className="mt-1">{t('nav.project')}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
