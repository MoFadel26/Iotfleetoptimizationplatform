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
  'compliance.col.proof': 'Proof',
  'compliance.status.implemented': 'Implemented',
  'compliance.status.planned': 'Planned',
  'compliance.proof.view': 'View Proof',
  'compliance.proof.toggleLang': 'Toggle Language',
  'compliance.cat.traffic': 'Traffic',
  'compliance.cat.delivery': 'Delivery',
  'compliance.cat.arabic': 'Arabic',
  'compliance.cat.data': 'Data',

  // Compliance — regulation rows (name = localized, nameAlt = opposite language subtitle)
  'compliance.reg.1.name': 'Saudi Traffic Law',
  'compliance.reg.1.nameAlt': 'نظام المرور',
  'compliance.reg.1.authority': 'BOE / SASO',
  'compliance.reg.1.implementation': 'Vehicle type attributes (axle count, gross weight) stored in fleet model; routing logic prevents assignment of prohibited road classes per vehicle type.',

  'compliance.reg.2.name': 'Driving hours limits',
  'compliance.reg.2.nameAlt': 'حدود ساعات القيادة',
  'compliance.reg.2.authority': 'TGA / PTA',
  'compliance.reg.2.implementation': 'Route scheduler enforces 9-hr daily cap and 56-hr weekly cap for commercial drivers; mandatory 45-min rest after 4.5 hrs of continuous driving built into dispatch logic.',

  'compliance.reg.3.name': 'Vehicle weight limits',
  'compliance.reg.3.nameAlt': 'حدود الأوزان والأبعاد',
  'compliance.reg.3.authority': 'Roads General Authority',
  'compliance.reg.3.implementation': 'Fleet capacity parameters capped at legal axle-weight limits (21–45 tons by axle count); overloaded assignments blocked at route-generation stage.',

  'compliance.reg.4.name': 'City-level truck/time bans',
  'compliance.reg.4.nameAlt': 'حظر الشاحنات في ساعات الذروة',
  'compliance.reg.4.authority': 'Municipal authorities',
  'compliance.reg.4.implementation': 'Configurable no-go zone polygons and vehicle-class time windows per city; Makkah peak-hour truck ban pre-loaded as default constraint.',

  'compliance.reg.5.name': 'TGA Delivery App registration',
  'compliance.reg.5.nameAlt': 'تسجيل التطبيق لدى هيئة النقل',
  'compliance.reg.5.authority': 'TGA',
  'compliance.reg.5.implementation': "Platform architecture designed to meet TGA 'Delivery Applications' category requirements; registration process initiated with TGA portal.",

  'compliance.reg.6.name': 'Driver identity verification',
  'compliance.reg.6.nameAlt': 'التحقق من هوية السائق',
  'compliance.reg.6.authority': 'TGA',
  'compliance.reg.6.implementation': "Driver login flow includes facial-recognition identity check before shift start, fulfilling TGA's mandatory verification requirement for delivery apps.",
  'compliance.reg.6.note': 'Full verification flow lives in the driver mobile app — switch to Mobile App view from the top bar to see it.',

  'compliance.reg.7.name': 'National Address requirement',
  'compliance.reg.7.nameAlt': 'اشتراط العنوان الوطني (يناير 2026)',
  'compliance.reg.7.authority': 'TGA / SPL',
  'compliance.reg.7.implementation': 'Address capture enforces valid National Address field for all shipments; back-end validates format against SPL/Absher schema before order acceptance.',

  'compliance.reg.8.name': 'Parcel delivery licensing',
  'compliance.reg.8.nameAlt': 'ترخيص نقل الطرود البريدية',
  'compliance.reg.8.authority': 'TGA / Postal Regulatory Commission',
  'compliance.reg.8.implementation': 'All integrated carriers verified to hold active TGA and postal licenses; platform terms clearly define intermediary (software) role to avoid unlicensed operator liability.',
  'compliance.reg.8.note': 'See the System Information section for platform and connectivity status.',

  'compliance.reg.9.name': 'National Arabic Language Policy',
  'compliance.reg.9.nameAlt': 'السياسة الوطنية للغة العربية (قرار 588)',
  'compliance.reg.9.authority': 'Council of Ministers',
  'compliance.reg.9.implementation': 'Full Arabic UI across customer app, driver app, and merchant dashboard; all legal texts professionally translated into Arabic as primary language.',
  'compliance.reg.9.note': 'Click to toggle the interface language between English and Arabic to verify full localization.',

  'compliance.reg.10.name': 'ZATCA e-invoicing (Arabic)',
  'compliance.reg.10.nameAlt': 'اشتراط الفاتورة الإلكترونية بالعربية',
  'compliance.reg.10.authority': 'ZATCA',
  'compliance.reg.10.implementation': 'All invoices and credit/debit notes generated with Arabic human-readable fields; supports Arabic and Hindi numerals per ZATCA detailed e-invoicing guideline v2.',
  'compliance.reg.10.note': 'Use the Export Report action on the Analytics page to generate an Arabic-compliant invoice sample.',

  'compliance.reg.11.name': 'Basic Law of Governance',
  'compliance.reg.11.nameAlt': 'النظام الأساسي للحكم (المادة 1)',
  'compliance.reg.11.authority': 'BOE',
  'compliance.reg.11.implementation': 'Arabic set as primary language system-wide; all official communications, contract terms, and mandatory disclosures available in Arabic before any other language.',
  'compliance.reg.11.note': 'Click to toggle the interface language and confirm Arabic is the primary system language.',

  'compliance.reg.12.name': 'Consumer invoice requirements',
  'compliance.reg.12.nameAlt': 'متطلبات فاتورة المستهلك',
  'compliance.reg.12.authority': 'Ministry of Commerce',
  'compliance.reg.12.implementation': 'Receipts and order confirmations include Arabic invoice number, business name, date, product description, and total with VAT — aligned with MCI consumer-rights guidance.',
  'compliance.reg.12.note': 'See the Export Report action on the Analytics page for a sample consumer invoice.',

  'compliance.reg.13.name': 'PDPL – data collection & consent',
  'compliance.reg.13.nameAlt': 'نظام حماية البيانات الشخصية – الموافقة',
  'compliance.reg.13.authority': 'SDAIA',
  'compliance.reg.13.implementation': 'Explicit consent prompts at onboarding; privacy policy explains processing purposes, legal bases, data-sharing with carriers, retention periods, and data-subject rights under PDPL.',
  'compliance.reg.13.note': 'See the Language & Regional Settings and System Information sections for consent and policy controls.',

  'compliance.reg.14.name': 'PDPL – location & courier tracking',
  'compliance.reg.14.nameAlt': 'بيانات الموقع ورصد السائق',
  'compliance.reg.14.authority': 'SDAIA',
  'compliance.reg.14.implementation': 'Real-time location data classified as personal data; AES-256 encryption in transit and at rest; role-based access controls; data minimization applied to location history retention.',

  'compliance.reg.15.name': 'PDPL – data subject rights',
  'compliance.reg.15.nameAlt': 'حقوق صاحب البيانات',
  'compliance.reg.15.authority': 'SDAIA / NDMO',
  'compliance.reg.15.implementation': 'In-app portal for access, correction, and deletion requests; all requests logged with timestamps for SDAIA audit readiness; 30-day response SLA per PDPL.',
  'compliance.reg.15.note': 'See the System Information and Language & Regional Settings sections for data-subject request controls.',

  'compliance.reg.16.name': 'PDPL – cross-border transfer',
  'compliance.reg.16.nameAlt': 'نقل البيانات عبر الحدود',
  'compliance.reg.16.authority': 'SDAIA',
  'compliance.reg.16.implementation': 'Cloud hosting adequacy assessment underway; contractual safeguards in place for non-KSA data centers; primary delivery data earmarked for KSA-region hosting.',
  'compliance.reg.16.note': 'See the System Information section for hosting, API and connectivity details.',

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
  'compliance.col.proof': 'الدليل',
  'compliance.status.implemented': 'مُنفَّذ',
  'compliance.status.planned': 'مُخطط له',
  'compliance.proof.view': 'عرض الدليل',
  'compliance.proof.toggleLang': 'تبديل اللغة',
  'compliance.cat.traffic': 'المرور',
  'compliance.cat.delivery': 'التوصيل',
  'compliance.cat.arabic': 'العربية',
  'compliance.cat.data': 'البيانات',

  // Compliance — regulation rows (name = localized, nameAlt = opposite language subtitle)
  'compliance.reg.1.name': 'نظام المرور',
  'compliance.reg.1.nameAlt': 'Saudi Traffic Law',
  'compliance.reg.1.authority': 'هيئة الخبراء / الهيئة السعودية للمواصفات',
  'compliance.reg.1.implementation': 'يتم تخزين خصائص نوع المركبة (عدد المحاور، الوزن الإجمالي) ضمن نموذج الأسطول؛ ومنطق تخطيط المسارات يمنع تخصيص فئات الطرق المحظورة حسب نوع المركبة.',

  'compliance.reg.2.name': 'حدود ساعات القيادة',
  'compliance.reg.2.nameAlt': 'Driving hours limits',
  'compliance.reg.2.authority': 'الهيئة العامة للنقل',
  'compliance.reg.2.implementation': 'مخطِّط المسارات يفرض سقف 9 ساعات يومياً و56 ساعة أسبوعياً للسائقين التجاريين، مع استراحة إلزامية 45 دقيقة بعد 4.5 ساعات من القيادة المتواصلة ضمن منطق الإرسال.',

  'compliance.reg.3.name': 'حدود الأوزان والأبعاد',
  'compliance.reg.3.nameAlt': 'Vehicle weight limits',
  'compliance.reg.3.authority': 'الهيئة العامة للطرق',
  'compliance.reg.3.implementation': 'معلمات سعة الأسطول مقيدة بحدود الأوزان القانونية للمحاور (21–45 طناً بحسب عدد المحاور)؛ ويُرفض إسناد أي حمولة زائدة في مرحلة إنشاء المسار.',

  'compliance.reg.4.name': 'حظر الشاحنات في ساعات الذروة',
  'compliance.reg.4.nameAlt': 'City-level truck/time bans',
  'compliance.reg.4.authority': 'الأمانات البلدية',
  'compliance.reg.4.implementation': 'مضلعات مناطق المنع قابلة للتهيئة ونوافذ زمنية لكل فئة مركبات لكل مدينة؛ وحظر الشاحنات في ساعات الذروة بمكة محمَّل مسبقاً كقيد افتراضي.',

  'compliance.reg.5.name': 'تسجيل التطبيق لدى هيئة النقل',
  'compliance.reg.5.nameAlt': 'TGA Delivery App registration',
  'compliance.reg.5.authority': 'الهيئة العامة للنقل',
  'compliance.reg.5.implementation': 'صُممت بنية المنصة لتلبية متطلبات فئة "تطبيقات التوصيل" لدى الهيئة العامة للنقل، وجارٍ استكمال إجراءات التسجيل عبر بوابة الهيئة.',

  'compliance.reg.6.name': 'التحقق من هوية السائق',
  'compliance.reg.6.nameAlt': 'Driver identity verification',
  'compliance.reg.6.authority': 'الهيئة العامة للنقل',
  'compliance.reg.6.implementation': 'تتضمن عملية دخول السائق تحققاً من الهوية عبر التعرف على الوجه قبل بدء الوردية، بما يلبي متطلبات التحقق الإلزامية لتطبيقات التوصيل لدى الهيئة العامة للنقل.',
  'compliance.reg.6.note': 'التدفق الكامل للتحقق موجود في تطبيق السائق — بدّل إلى وضع تطبيق الجوال من الشريط العلوي لعرضه.',

  'compliance.reg.7.name': 'اشتراط العنوان الوطني (يناير 2026)',
  'compliance.reg.7.nameAlt': 'National Address requirement',
  'compliance.reg.7.authority': 'هيئة النقل / البريد السعودي',
  'compliance.reg.7.implementation': 'إدخال العنوان يفرض حقل عنوان وطني صالحاً لكل الشحنات؛ ويتحقق الخلفي من التنسيق مقابل نموذج البريد السعودي/أبشر قبل قبول الطلب.',

  'compliance.reg.8.name': 'ترخيص نقل الطرود البريدية',
  'compliance.reg.8.nameAlt': 'Parcel delivery licensing',
  'compliance.reg.8.authority': 'هيئة النقل / هيئة البريد',
  'compliance.reg.8.implementation': 'جميع الناقلين المدمجين جرى التحقق من حيازتهم تراخيص سارية من هيئة النقل وهيئة البريد؛ وتُحدِّد شروط المنصة دور الوسيط (البرمجي) بوضوح لتجنّب المسؤولية كمشغّل غير مرخّص.',
  'compliance.reg.8.note': 'راجع قسم "معلومات النظام" للاطلاع على حالة المنصة والاتصال.',

  'compliance.reg.9.name': 'السياسة الوطنية للغة العربية (قرار 588)',
  'compliance.reg.9.nameAlt': 'National Arabic Language Policy',
  'compliance.reg.9.authority': 'مجلس الوزراء',
  'compliance.reg.9.implementation': 'واجهة عربية كاملة في تطبيق العميل وتطبيق السائق ولوحة التاجر؛ وجميع النصوص القانونية مترجمة ترجمة احترافية إلى العربية كلغة أساسية.',
  'compliance.reg.9.note': 'اضغط لتبديل لغة الواجهة بين الإنجليزية والعربية للتأكد من التوطين الكامل.',

  'compliance.reg.10.name': 'اشتراط الفاتورة الإلكترونية بالعربية',
  'compliance.reg.10.nameAlt': 'ZATCA e-invoicing (Arabic)',
  'compliance.reg.10.authority': 'هيئة الزكاة والضريبة والجمارك',
  'compliance.reg.10.implementation': 'جميع الفواتير وإشعارات الخصم والدائن تُولَّد بحقول عربية مقروءة للبشر؛ وتدعم الأرقام العربية والهندية وفق الدليل التفصيلي للفوترة الإلكترونية v2 الصادر عن الهيئة.',
  'compliance.reg.10.note': 'استخدم إجراء "تصدير التقرير" في صفحة التحليلات لإنشاء نموذج فاتورة متوافقة بالعربية.',

  'compliance.reg.11.name': 'النظام الأساسي للحكم (المادة 1)',
  'compliance.reg.11.nameAlt': 'Basic Law of Governance',
  'compliance.reg.11.authority': 'هيئة الخبراء',
  'compliance.reg.11.implementation': 'العربية مُعيَّنة كلغة أساسية على مستوى النظام؛ وجميع المراسلات الرسمية وبنود العقود والإفصاحات الإلزامية متاحة بالعربية قبل أي لغة أخرى.',
  'compliance.reg.11.note': 'اضغط لتبديل لغة الواجهة والتأكد من أن العربية هي لغة النظام الأساسية.',

  'compliance.reg.12.name': 'متطلبات فاتورة المستهلك',
  'compliance.reg.12.nameAlt': 'Consumer invoice requirements',
  'compliance.reg.12.authority': 'وزارة التجارة',
  'compliance.reg.12.implementation': 'الإيصالات وتأكيدات الطلبات تتضمّن رقم الفاتورة بالعربية واسم المنشأة والتاريخ ووصف المنتج والإجمالي شاملاً ضريبة القيمة المضافة — بما يتسق مع إرشادات حقوق المستهلك لدى وزارة التجارة.',
  'compliance.reg.12.note': 'راجع إجراء "تصدير التقرير" في صفحة التحليلات للاطلاع على نموذج فاتورة المستهلك.',

  'compliance.reg.13.name': 'نظام حماية البيانات الشخصية – الموافقة',
  'compliance.reg.13.nameAlt': 'PDPL – data collection & consent',
  'compliance.reg.13.authority': 'هيئة البيانات والذكاء الاصطناعي',
  'compliance.reg.13.implementation': 'طلبات موافقة صريحة عند التسجيل؛ وسياسة الخصوصية تشرح أغراض المعالجة والأسس القانونية ومشاركة البيانات مع الناقلين وفترات الاحتفاظ وحقوق صاحب البيانات وفق النظام.',
  'compliance.reg.13.note': 'راجع قسمَي "اللغة والإعدادات الإقليمية" و"معلومات النظام" لضوابط الموافقة والسياسة.',

  'compliance.reg.14.name': 'بيانات الموقع ورصد السائق',
  'compliance.reg.14.nameAlt': 'PDPL – location & courier tracking',
  'compliance.reg.14.authority': 'هيئة البيانات والذكاء الاصطناعي',
  'compliance.reg.14.implementation': 'بيانات الموقع الفورية مصنّفة كبيانات شخصية؛ تشفير AES-256 أثناء النقل وفي التخزين؛ وضبط صلاحيات قائم على الأدوار؛ وتقليل البيانات مطبَّق على الاحتفاظ بتاريخ المواقع.',

  'compliance.reg.15.name': 'حقوق صاحب البيانات',
  'compliance.reg.15.nameAlt': 'PDPL – data subject rights',
  'compliance.reg.15.authority': 'هيئة البيانات / المكتب الوطني لإدارة البيانات',
  'compliance.reg.15.implementation': 'بوابة داخل التطبيق لطلبات الاطلاع والتصحيح والحذف؛ وجميع الطلبات تُسجَّل بختم زمني استعداداً لتدقيق الهيئة؛ واتفاقية مستوى خدمة 30 يوماً وفق النظام.',
  'compliance.reg.15.note': 'راجع قسمَي "معلومات النظام" و"اللغة والإعدادات الإقليمية" لضوابط طلبات صاحب البيانات.',

  'compliance.reg.16.name': 'نقل البيانات عبر الحدود',
  'compliance.reg.16.nameAlt': 'PDPL – cross-border transfer',
  'compliance.reg.16.authority': 'هيئة البيانات والذكاء الاصطناعي',
  'compliance.reg.16.implementation': 'جارٍ تقييم كفاية الاستضافة السحابية؛ وضمانات تعاقدية مع مراكز البيانات خارج المملكة؛ وبيانات التوصيل الأساسية مخصصة للاستضافة في منطقة المملكة.',
  'compliance.reg.16.note': 'راجع قسم "معلومات النظام" للاطلاع على تفاصيل الاستضافة وحالة الاتصال.',

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
