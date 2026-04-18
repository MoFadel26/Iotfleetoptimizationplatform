import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'ur';
export type DashboardLanguage = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('fleetiot-lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fleetiot-lang', lang);
  };

  const isRTL = language === 'ar' || language === 'ur';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string): string => {
    const translations = allTranslations[language];
    return translations?.[key] ?? allTranslations['en'][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Translation Tables ──────────────────────────────────────────────────────

const en: Record<string, string> = {
  // App top bar
  'app.webDashboard': 'Web Dashboard',
  'app.mobileApp': 'Mobile App',

  // Dashboard Sidebar
  'nav.overview': 'Overview',
  'nav.liveFleet': 'Live Fleet',
  'nav.optimization': 'Optimization',
  'nav.analytics': 'Analytics',
  'nav.compliance': 'Compliance',
  'nav.settings': 'Settings',
  'nav.portal': 'Dispatcher Portal v2.1',
  'nav.project': 'Senior Design Project 2026',

  // CompliancePage
  'compliance.title': 'Regulatory Compliance',
  'compliance.subtitle': 'Saudi Arabia regulatory framework alignment matrix',
  'compliance.stat.total': 'Total Regulations',
  'compliance.stat.implemented': 'Implemented',
  'compliance.stat.planned': 'Planned',
  'compliance.filter.all': 'All',
  'compliance.filter.traffic': 'Traffic & Vehicles',
  'compliance.filter.delivery': 'Delivery Platform',
  'compliance.filter.arabic': 'Arabic Localization',
  'compliance.filter.data': 'Data Protection',
  'compliance.col.regulation': 'Regulation',
  'compliance.col.authority': 'Authority',
  'compliance.col.implementation': 'System Implementation',
  'compliance.col.status': 'Status',
  'compliance.status.implemented': 'Implemented',
  'compliance.status.planned': 'Planned',

  // HomePage
  'home.title': 'Fleet Operations Dashboard',
  'home.subtitle': 'Real-time monitoring and optimization for hybrid fleet operations',
  'home.liveConnected': 'Live Data Connected',
  'home.lastUpdated': 'Last updated',
  'home.totalCost': 'Total Delivery Cost',
  'home.co2Emissions': 'CO₂ Emissions',
  'home.fleetUtilization': 'Fleet Utilization',
  'home.workloadFairness': 'Workload Fairness Index',
  'home.trendCost': '↓ 3.2% from last month',
  'home.trendCO2': '↓ 8.5% from last month',
  'home.trendUtil': '↑ 5.1% from last month',
  'home.trendTarget': 'Target: > 0.80',
  'home.fleetStatus': 'Fleet Status',
  'home.onRoute': 'On Route',
  'home.activeDeliveries': 'Active deliveries',
  'home.idle': 'Idle',
  'home.availableDispatch': 'Available for dispatch',
  'home.delayed': 'Delayed',
  'home.requiresAttention': 'Requires attention',
  'home.vehicleTypes': 'Vehicle Types Distribution',
  'home.iceТrucks': 'ICE Trucks',
  'home.conventionalFleet': 'Conventional fleet',
  'home.electricVehicles': 'Electric Vehicles',
  'home.zeroEmission': 'Zero emission',
  'home.quickActions': 'Quick Actions',
  'home.runOptimization': 'Run Route Optimization',
  'home.viewFleetMap': 'View Live Fleet Map',
  'home.generateReport': 'Generate Report',

  // LiveFleetMapPage
  'fleet.title': 'Live Fleet Map',
  'fleet.subtitle': 'Real-time vehicle tracking and status monitoring',
  'fleet.location': 'Riyadh, Saudi Arabia',
  'fleet.liveTracking': 'Live Fleet Tracking',
  'fleet.legend': 'Legend',
  'fleet.onRoute': 'On Route',
  'fleet.delayed': 'Delayed',
  'fleet.idle': 'Idle',
  'fleet.vehicleDetails': 'Vehicle Details',
  'fleet.selectVehicle': 'Select a vehicle on the map to view details',
  'fleet.driver': 'Driver',
  'fleet.currentLocation': 'Current Location',
  'fleet.speed': 'Speed',
  'fleet.nextStop': 'Next Stop',
  'fleet.eta': 'ETA',
  'fleet.remainingStops': 'Remaining Stops',
  'fleet.routeProgress': 'Route Progress',
  'fleet.contactDriver': 'Contact Driver',
  'fleet.battery': 'Battery',
  'fleet.fuel': 'Fuel',

  // RouteOptimizationPage
  'route.title': 'Route Optimization',
  'route.subtitle': 'AI-powered route planning for hybrid fleet',
  'route.configuration': 'Optimization Configuration',
  'route.costMin': 'Cost Minimization',
  'route.costMinDesc': 'Prioritize SAR cost efficiency',
  'route.co2Min': 'CO₂ Minimization',
  'route.co2MinDesc': 'Reduce carbon footprint',
  'route.balanced': 'Balanced',
  'route.balancedDesc': 'Optimize all objectives equally',
  'route.runOptimization': 'Run Optimization',
  'route.optimizing': 'Optimizing...',
  'route.fleetSummary': 'Fleet Summary',
  'route.vehicles': 'vehicles',
  'route.routes': 'routes',
  'route.stops': 'stops',
  'route.solveTime': 'Solve time',
  'route.results': 'Optimization Results',
  'route.waitingTitle': 'Ready to Optimize',
  'route.waitingDesc': 'Select an objective and click Run Optimization to generate optimal routes',
  'route.totalCost': 'Total Cost',
  'route.totalEmissions': 'Total Emissions',
  'route.avgUtilization': 'Avg. Utilization',
  'route.fairnessIndex': 'Fairness Index',

  // AnalyticsPage
  'analytics.title': 'Analytics & Reporting',
  'analytics.subtitle': 'Fleet performance insights and sustainability metrics',
  'analytics.export': 'Export Report',
  'analytics.costVsCO2': 'Cost vs CO₂ Emissions Over Time',
  'analytics.dailyTrends': 'Daily cost and emission trends',
  'analytics.cost': 'Cost (SAR)',
  'analytics.co2': 'CO₂ (kg)',
  'analytics.insight': 'Insight: Electric vehicles contributed to 23% reduction in CO₂ emissions',
  'analytics.utilizationTitle': 'Hourly Fleet Utilization',
  'analytics.utilizationDesc': 'Vehicle usage patterns throughout the day',
  'analytics.peakHours': 'Peak Hours',
  'analytics.avgUtilization': 'Average Utilization',
  'analytics.offPeak': 'Off-Peak Hours',
  'analytics.vehiclePerf': 'Vehicle Performance Breakdown',
  'analytics.vehiclePerfDesc': 'Individual vehicle efficiency metrics',
  'analytics.alertTitle': 'High Fuel Cost Alert',
  'analytics.alertDesc': 'ICE trucks are consuming 34% more fuel than projected. Consider route rebalancing.',
  'analytics.driverPerf': 'Driver Performance Comparison',
  'analytics.driverPerfDesc': 'Comparative efficiency and delivery metrics',
  'analytics.driverName': 'Driver',
  'analytics.deliveries': 'Deliveries',
  'analytics.onTime': 'On-Time %',
  'analytics.efficiency': 'Efficiency',

  // SettingsPage
  'settings.title': 'Settings',
  'settings.subtitle': 'Configure fleet parameters and system preferences',
  'settings.fleetConfig': 'Fleet Configuration',
  'settings.fleetConfigDesc': 'Manage vehicle types and capacities',
  'settings.iceTrucksCount': 'ICE Trucks Count',
  'settings.iceTruckCapacity': 'ICE Truck Capacity (kg)',
  'settings.evCount': 'Electric Vehicles Count',
  'settings.evCapacity': 'EV Capacity (kg)',
  'settings.startTime': 'Operating Start Time',
  'settings.endTime': 'Operating End Time',
  'settings.optimization': 'Optimization Weights',
  'settings.optimizationDesc': 'Adjust algorithm priorities',
  'settings.costWeight': 'Cost Weight',
  'settings.co2Weight': 'CO₂ Weight',
  'settings.workloadWeight': 'Workload Balance Weight',
  'settings.weightsOk': 'Weights are balanced (100%)',
  'settings.weightsWarning': '⚠ Warning: Weights should sum to 100% (Currently:',
  'settings.language': 'Language & Regional Settings',
  'settings.languageDesc': 'Interface language and localization',
  'settings.interfaceLang': 'Interface Language',
  'settings.english': 'English',
  'settings.arabic': 'العربية',
  'settings.currency': 'Currency',
  'settings.save': 'Save Settings',
  'settings.reset': 'Reset to Defaults',
  'settings.system': 'System Information',
  'settings.systemDesc': 'Platform and connectivity status',
  'settings.version': 'Platform Version',
  'settings.apiStatus': 'API Status',
  'settings.connected': 'Connected',
  'settings.dataRefresh': 'Data Refresh Rate',
  'settings.refreshRate': '30 seconds',

  // Mobile Layout
  'mobile.appTitle': 'FleetIoT Driver',
  'mobile.home': 'Home',
  'mobile.route': 'Route',
  'mobile.vehicle': 'Vehicle',
  'mobile.alerts': 'Alerts',
  'mobile.profile': 'Profile',

  // DriverHomePage
  'driver.welcome': 'Welcome, Mohammed',
  'driver.today': 'Today is Sunday, February 1, 2026',
  'driver.activeRoute': 'Active Route',
  'driver.stops': 'Stops',
  'driver.estCompletion': 'Est. Completion',
  'driver.progress': 'Progress',
  'driver.packages': 'Packages',
  'driver.estTime': 'Est. Time',
  'driver.nextStop': 'Next Stop',
  'driver.startNavigation': 'Start Navigation',
  'driver.completedToday': 'Completed Today',
  'driver.greatPerformance': 'Great Performance!',
  'driver.aheadSchedule': "You're 15 minutes ahead of schedule",

  // RouteNavigationPage
  'nav2.title': 'Route Navigation',
  'nav2.stopDetails': 'Stop Details',
  'nav2.packages': 'packages',
  'nav2.eta': 'ETA',
  'nav2.navigate': 'Navigate Here',
  'nav2.markDelivered': 'Mark as Delivered',
  'nav2.completed': 'Completed',
  'nav2.current': 'In Progress',
  'nav2.upcoming': 'Upcoming',

  // VehicleStatusPage
  'vehicle.title': 'Vehicle EV-02',
  'vehicle.type': 'Electric Vehicle',
  'vehicle.active': 'Active',
  'vehicle.onRoute': 'On Route',
  'vehicle.batteryLevel': 'Battery Level',
  'vehicle.estimatedRange': 'Estimated Range',
  'vehicle.chargingNotRequired': 'Charging: Not Required',
  'vehicle.performance': 'Performance Metrics',
  'vehicle.speed': 'Current Speed',
  'vehicle.temp': 'Motor Temp',
  'vehicle.iotStatus': 'IoT Connectivity Status',
  'vehicle.gps': 'GPS',
  'vehicle.telematics': 'Telematics',
  'vehicle.cellular': 'Cellular',
  'vehicle.diagnostics': 'Vehicle Diagnostics',
  'vehicle.allSystems': 'All Systems Normal',
  'vehicle.allSystemsDesc': 'No warnings or errors detected',

  // NotificationsPage
  'notif.title': 'Notifications',
  'notif.unread': 'unread notification',
  'notif.unreadPlural': 'unread notifications',
  'notif.markAllRead': 'Mark All Read',

  // ProfilePage
  'profile.since': 'Member since Jan 2025',
  'profile.performanceSummary': 'Performance Summary',
  'profile.totalDeliveries': 'Total Deliveries',
  'profile.onTimeRate': 'On-Time Rate',
  'profile.efficiency': 'Efficiency',
  'profile.fuelSavings': 'Fuel Savings',
  'profile.settings': 'Settings',
  'profile.logout': 'Logout',
  'profile.language': 'Language',
  'profile.selectLanguage': 'Select Language',
};

const ar: Record<string, string> = {
  // App top bar
  'app.webDashboard': 'لوحة التحكم',
  'app.mobileApp': 'تطبيق الجوال',

  // Dashboard Sidebar
  'nav.overview': 'نظرة عامة',
  'nav.liveFleet': 'الأسطول المباشر',
  'nav.optimization': 'التحسين',
  'nav.analytics': 'التحليلات',
  'nav.compliance': 'الامتثال',
  'nav.settings': 'الإعدادات',
  'nav.portal': 'بوابة المرسل v2.1',
  'nav.project': 'مشروع التخرج 2026',

  // CompliancePage
  'compliance.title': 'الامتثال التنظيمي',
  'compliance.subtitle': 'مصفوفة مواءمة الإطار التنظيمي للمملكة العربية السعودية',
  'compliance.stat.total': 'إجمالي اللوائح',
  'compliance.stat.implemented': 'مُنفَّذ',
  'compliance.stat.planned': 'مُخطط له',
  'compliance.filter.all': 'الكل',
  'compliance.filter.traffic': 'المرور والمركبات',
  'compliance.filter.delivery': 'منصة التوصيل',
  'compliance.filter.arabic': 'التوطين العربي',
  'compliance.filter.data': 'حماية البيانات',
  'compliance.col.regulation': 'اللائحة',
  'compliance.col.authority': 'الجهة التنظيمية',
  'compliance.col.implementation': 'التنفيذ في النظام',
  'compliance.col.status': 'الحالة',
  'compliance.status.implemented': 'مُنفَّذ',
  'compliance.status.planned': 'مُخطط له',

  // HomePage
  'home.title': 'لوحة تحكم عمليات الأسطول',
  'home.subtitle': 'المراقبة الفورية والتحسين لعمليات الأسطول الهجين',
  'home.liveConnected': 'البيانات المباشرة متصلة',
  'home.lastUpdated': 'آخر تحديث',
  'home.totalCost': 'إجمالي تكلفة التوصيل',
  'home.co2Emissions': 'انبعاثات ثاني أكسيد الكربون',
  'home.fleetUtilization': 'استخدام الأسطول',
  'home.workloadFairness': 'مؤشر توازن العمل',
  'home.trendCost': '↓ 3.2% مقارنة بالشهر الماضي',
  'home.trendCO2': '↓ 8.5% مقارنة بالشهر الماضي',
  'home.trendUtil': '↑ 5.1% مقارنة بالشهر الماضي',
  'home.trendTarget': 'الهدف: > 0.80',
  'home.fleetStatus': 'حالة الأسطول',
  'home.onRoute': 'في الطريق',
  'home.activeDeliveries': 'توصيلات نشطة',
  'home.idle': 'خامل',
  'home.availableDispatch': 'متاح للإرسال',
  'home.delayed': 'متأخر',
  'home.requiresAttention': 'يحتاج إلى اهتمام',
  'home.vehicleTypes': 'توزيع أنواع المركبات',
  'home.iceТrucks': 'شاحنات ICE',
  'home.conventionalFleet': 'الأسطول التقليدي',
  'home.electricVehicles': 'المركبات الكهربائية',
  'home.zeroEmission': 'صفر انبعاثات',
  'home.quickActions': 'إجراءات سريعة',
  'home.runOptimization': 'تشغيل تحسين المسار',
  'home.viewFleetMap': 'عرض خريطة الأسطول المباشرة',
  'home.generateReport': 'إنشاء تقرير',

  // LiveFleetMapPage
  'fleet.title': 'خريطة الأسطول المباشرة',
  'fleet.subtitle': 'تتبع المركبات في الوقت الفعلي ومراقبة الحالة',
  'fleet.location': 'الرياض، المملكة العربية السعودية',
  'fleet.liveTracking': 'تتبع الأسطول المباشر',
  'fleet.legend': 'المفتاح',
  'fleet.onRoute': 'في الطريق',
  'fleet.delayed': 'متأخر',
  'fleet.idle': 'خامل',
  'fleet.vehicleDetails': 'تفاصيل المركبة',
  'fleet.selectVehicle': 'اختر مركبة من الخريطة لعرض التفاصيل',
  'fleet.driver': 'السائق',
  'fleet.currentLocation': 'الموقع الحالي',
  'fleet.speed': 'السرعة',
  'fleet.nextStop': 'المحطة التالية',
  'fleet.eta': 'وقت الوصول المتوقع',
  'fleet.remainingStops': 'المحطات المتبقية',
  'fleet.routeProgress': 'تقدم المسار',
  'fleet.contactDriver': 'التواصل مع السائق',
  'fleet.battery': 'البطارية',
  'fleet.fuel': 'الوقود',

  // RouteOptimizationPage
  'route.title': 'تحسين المسار',
  'route.subtitle': 'تخطيط المسار بالذكاء الاصطناعي للأسطول الهجين',
  'route.configuration': 'إعدادات التحسين',
  'route.costMin': 'تقليل التكلفة',
  'route.costMinDesc': 'إعطاء الأولوية لكفاءة التكلفة بالريال السعودي',
  'route.co2Min': 'تقليل ثاني أكسيد الكربون',
  'route.co2MinDesc': 'تقليل البصمة الكربونية',
  'route.balanced': 'متوازن',
  'route.balancedDesc': 'تحسين جميع الأهداف بالتساوي',
  'route.runOptimization': 'تشغيل التحسين',
  'route.optimizing': 'جارٍ التحسين...',
  'route.fleetSummary': 'ملخص الأسطول',
  'route.vehicles': 'مركبات',
  'route.routes': 'مسارات',
  'route.stops': 'محطات',
  'route.solveTime': 'وقت الحل',
  'route.results': 'نتائج التحسين',
  'route.waitingTitle': 'جاهز للتحسين',
  'route.waitingDesc': 'اختر هدفاً وانقر على تشغيل التحسين لإنشاء مسارات مثلى',
  'route.totalCost': 'التكلفة الإجمالية',
  'route.totalEmissions': 'إجمالي الانبعاثات',
  'route.avgUtilization': 'متوسط الاستخدام',
  'route.fairnessIndex': 'مؤشر العدالة',

  // AnalyticsPage
  'analytics.title': 'التحليلات والتقارير',
  'analytics.subtitle': 'رؤى أداء الأسطول ومقاييس الاستدامة',
  'analytics.export': 'تصدير التقرير',
  'analytics.costVsCO2': 'التكلفة مقابل انبعاثات ثاني أكسيد الكربون عبر الزمن',
  'analytics.dailyTrends': 'اتجاهات التكلفة والانبعاثات اليومية',
  'analytics.cost': 'التكلفة (ريال)',
  'analytics.co2': 'CO₂ (كجم)',
  'analytics.insight': 'رؤية: أسهمت المركبات الكهربائية في تقليل انبعاثات CO₂ بنسبة 23%',
  'analytics.utilizationTitle': 'استخدام الأسطول بالساعة',
  'analytics.utilizationDesc': 'أنماط استخدام المركبات على مدار اليوم',
  'analytics.peakHours': 'ساعات الذروة',
  'analytics.avgUtilization': 'متوسط الاستخدام',
  'analytics.offPeak': 'ساعات خارج الذروة',
  'analytics.vehiclePerf': 'تفصيل أداء المركبات',
  'analytics.vehiclePerfDesc': 'مقاييس كفاءة المركبات الفردية',
  'analytics.alertTitle': 'تنبيه: ارتفاع تكلفة الوقود',
  'analytics.alertDesc': 'شاحنات ICE تستهلك وقوداً أكثر بنسبة 34% من المتوقع. يُنصح بإعادة توازن المسارات.',
  'analytics.driverPerf': 'مقارنة أداء السائقين',
  'analytics.driverPerfDesc': 'مقاييس الكفاءة والتوصيل المقارنة',
  'analytics.driverName': 'السائق',
  'analytics.deliveries': 'التوصيلات',
  'analytics.onTime': 'نسبة الالتزام بالوقت',
  'analytics.efficiency': 'الكفاءة',

  // SettingsPage
  'settings.title': 'الإعدادات',
  'settings.subtitle': 'تكوين معلمات الأسطول وتفضيلات النظام',
  'settings.fleetConfig': 'إعداد الأسطول',
  'settings.fleetConfigDesc': 'إدارة أنواع المركبات وسعاتها',
  'settings.iceTrucksCount': 'عدد شاحنات ICE',
  'settings.iceTruckCapacity': 'سعة شاحنة ICE (كجم)',
  'settings.evCount': 'عدد المركبات الكهربائية',
  'settings.evCapacity': 'سعة المركبة الكهربائية (كجم)',
  'settings.startTime': 'وقت بدء التشغيل',
  'settings.endTime': 'وقت انتهاء التشغيل',
  'settings.optimization': 'أوزان التحسين',
  'settings.optimizationDesc': 'ضبط أولويات الخوارزمية',
  'settings.costWeight': 'وزن التكلفة',
  'settings.co2Weight': 'وزن ثاني أكسيد الكربون',
  'settings.workloadWeight': 'وزن توازن العمل',
  'settings.weightsOk': 'الأوزان متوازنة (100%)',
  'settings.weightsWarning': '⚠ تحذير: يجب أن تبلغ الأوزان 100% (حالياً:',
  'settings.language': 'اللغة والإعدادات الإقليمية',
  'settings.languageDesc': 'لغة الواجهة والتوطين',
  'settings.interfaceLang': 'لغة الواجهة',
  'settings.english': 'English',
  'settings.arabic': 'العربية',
  'settings.currency': 'العملة',
  'settings.save': 'حفظ الإعدادات',
  'settings.reset': 'إعادة تعيين للافتراضيات',
  'settings.system': 'معلومات النظام',
  'settings.systemDesc': 'حالة المنصة والاتصال',
  'settings.version': 'إصدار المنصة',
  'settings.apiStatus': 'حالة API',
  'settings.connected': 'متصل',
  'settings.dataRefresh': 'معدل تحديث البيانات',
  'settings.refreshRate': '30 ثانية',

  // Mobile Layout
  'mobile.appTitle': 'FleetIoT سائق',
  'mobile.home': 'الرئيسية',
  'mobile.route': 'المسار',
  'mobile.vehicle': 'المركبة',
  'mobile.alerts': 'التنبيهات',
  'mobile.profile': 'الملف',

  // DriverHomePage
  'driver.welcome': 'مرحباً، محمد',
  'driver.today': 'اليوم الأحد، 1 فبراير 2026',
  'driver.activeRoute': 'المسار النشط',
  'driver.stops': 'المحطات',
  'driver.estCompletion': 'وقت الانتهاء المتوقع',
  'driver.progress': 'التقدم',
  'driver.packages': 'الطرود',
  'driver.estTime': 'الوقت المتوقع',
  'driver.nextStop': 'المحطة التالية',
  'driver.startNavigation': 'بدء الملاحة',
  'driver.completedToday': 'مكتمل اليوم',
  'driver.greatPerformance': 'أداء رائع!',
  'driver.aheadSchedule': 'أنت متقدم 15 دقيقة عن الجدول الزمني',

  // RouteNavigationPage
  'nav2.title': 'ملاحة المسار',
  'nav2.stopDetails': 'تفاصيل المحطة',
  'nav2.packages': 'طرود',
  'nav2.eta': 'وقت الوصول',
  'nav2.navigate': 'الملاحة إلى هنا',
  'nav2.markDelivered': 'تعيين كمُسلَّم',
  'nav2.completed': 'مكتمل',
  'nav2.current': 'جارٍ',
  'nav2.upcoming': 'قادم',

  // VehicleStatusPage
  'vehicle.title': 'المركبة EV-02',
  'vehicle.type': 'مركبة كهربائية',
  'vehicle.active': 'نشط',
  'vehicle.onRoute': 'في الطريق',
  'vehicle.batteryLevel': 'مستوى البطارية',
  'vehicle.estimatedRange': 'المدى المتوقع',
  'vehicle.chargingNotRequired': 'الشحن: غير مطلوب',
  'vehicle.performance': 'مقاييس الأداء',
  'vehicle.speed': 'السرعة الحالية',
  'vehicle.temp': 'حرارة المحرك',
  'vehicle.iotStatus': 'حالة اتصال IoT',
  'vehicle.gps': 'GPS',
  'vehicle.telematics': 'بيانات المركبة',
  'vehicle.cellular': 'شبكة خلوية',
  'vehicle.diagnostics': 'تشخيص المركبة',
  'vehicle.allSystems': 'جميع الأنظمة طبيعية',
  'vehicle.allSystemsDesc': 'لا توجد تحذيرات أو أخطاء',

  // NotificationsPage
  'notif.title': 'الإشعارات',
  'notif.unread': 'إشعار غير مقروء',
  'notif.unreadPlural': 'إشعارات غير مقروءة',
  'notif.markAllRead': 'تعيين الكل كمقروء',

  // ProfilePage
  'profile.since': 'عضو منذ يناير 2025',
  'profile.performanceSummary': 'ملخص الأداء',
  'profile.totalDeliveries': 'إجمالي التوصيلات',
  'profile.onTimeRate': 'معدل الالتزام بالوقت',
  'profile.efficiency': 'الكفاءة',
  'profile.fuelSavings': 'توفير الوقود',
  'profile.settings': 'الإعدادات',
  'profile.logout': 'تسجيل الخروج',
  'profile.language': 'اللغة',
  'profile.selectLanguage': 'اختر اللغة',
};

const ur: Record<string, string> = {
  // App top bar
  'app.webDashboard': 'ویب ڈیش بورڈ',
  'app.mobileApp': 'موبائل ایپ',

  // Mobile Layout
  'mobile.appTitle': 'FleetIoT ڈرائیور',
  'mobile.home': 'ہوم',
  'mobile.route': 'راستہ',
  'mobile.vehicle': 'گاڑی',
  'mobile.alerts': 'اطلاعات',
  'mobile.profile': 'پروفائل',

  // DriverHomePage
  'driver.welcome': 'خوش آمدید، محمد',
  'driver.today': 'آج اتوار، 1 فروری 2026 ہے',
  'driver.activeRoute': 'فعال راستہ',
  'driver.stops': 'پڑاؤ',
  'driver.estCompletion': 'متوقع تکمیل',
  'driver.progress': 'پیش رفت',
  'driver.packages': 'پارسل',
  'driver.estTime': 'متوقع وقت',
  'driver.nextStop': 'اگلا پڑاؤ',
  'driver.startNavigation': 'نیویگیشن شروع کریں',
  'driver.completedToday': 'آج مکمل',
  'driver.greatPerformance': 'شاندار کارکردگی!',
  'driver.aheadSchedule': 'آپ شیڈول سے 15 منٹ آگے ہیں',

  // RouteNavigationPage
  'nav2.title': 'راستہ نیویگیشن',
  'nav2.stopDetails': 'پڑاؤ کی تفصیلات',
  'nav2.packages': 'پارسل',
  'nav2.eta': 'متوقع آمد',
  'nav2.navigate': 'یہاں نیویگیٹ کریں',
  'nav2.markDelivered': 'ڈیلیور کے طور پر نشان لگائیں',
  'nav2.completed': 'مکمل',
  'nav2.current': 'جاری',
  'nav2.upcoming': 'آنے والا',

  // VehicleStatusPage
  'vehicle.title': 'گاڑی EV-02',
  'vehicle.type': 'برقی گاڑی',
  'vehicle.active': 'فعال',
  'vehicle.onRoute': 'راستے پر',
  'vehicle.batteryLevel': 'بیٹری کی سطح',
  'vehicle.estimatedRange': 'متوقع رینج',
  'vehicle.chargingNotRequired': 'چارجنگ: ضروری نہیں',
  'vehicle.performance': 'کارکردگی کے میٹرکس',
  'vehicle.speed': 'موجودہ رفتار',
  'vehicle.temp': 'موٹر درجہ حرارت',
  'vehicle.iotStatus': 'IoT کنیکٹیویٹی',
  'vehicle.gps': 'GPS',
  'vehicle.telematics': 'ٹیلی میٹکس',
  'vehicle.cellular': 'سیلولر',
  'vehicle.diagnostics': 'گاڑی کی تشخیص',
  'vehicle.allSystems': 'تمام سسٹم نارمل',
  'vehicle.allSystemsDesc': 'کوئی انتباہ یا خرابی نہیں',

  // NotificationsPage
  'notif.title': 'اطلاعات',
  'notif.unread': 'نہ پڑھی گئی اطلاع',
  'notif.unreadPlural': 'نہ پڑھی گئی اطلاعات',
  'notif.markAllRead': 'سب کو پڑھا ہوا نشان لگائیں',

  // ProfilePage
  'profile.since': 'جنوری 2025 سے رکن',
  'profile.performanceSummary': 'کارکردگی کا خلاصہ',
  'profile.totalDeliveries': 'کل ڈیلیوریاں',
  'profile.onTimeRate': 'بروقت شرح',
  'profile.efficiency': 'کارکردگی',
  'profile.fuelSavings': 'ایندھن کی بچت',
  'profile.settings': 'ترتیبات',
  'profile.logout': 'لاگ آؤٹ',
  'profile.language': 'زبان',
  'profile.selectLanguage': 'زبان منتخب کریں',

  // Fleet / Route / Analytics / Settings (fallback to English for web, only mobile matters)
  'nav.overview': 'جائزہ',
  'nav.liveFleet': 'لائیو فلیٹ',
  'nav.optimization': 'اصلاح',
  'nav.analytics': 'تجزیات',
  'nav.compliance': 'تعمیل',
  'nav.settings': 'ترتیبات',
  'nav.portal': 'ڈسپیچر پورٹل v2.1',
  'nav.project': 'سینئر ڈیزائن پروجیکٹ 2026',
  'home.title': 'فلیٹ آپریشنز ڈیش بورڈ',
  'home.subtitle': 'ہائبرڈ فلیٹ آپریشنز کی ریئل ٹائم نگرانی',
  'fleet.title': 'لائیو فلیٹ نقشہ',
  'route.title': 'راستے کی اصلاح',
  'analytics.title': 'تجزیات اور رپورٹنگ',
  'settings.title': 'ترتیبات',
};

export const allTranslations: Record<Language, Record<string, string>> = { en, ar, ur };
