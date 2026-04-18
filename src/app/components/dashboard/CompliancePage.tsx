import React from 'react';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { useLanguage } from '@/app/i18n/LanguageContext';

type Category = 'traffic' | 'delivery' | 'arabic' | 'data';
type Status = 'implemented' | 'planned';

interface Regulation {
  cat: Category;
  reg: string;
  ar: string;
  auth: string;
  impl: string;
  status: Status;
}

const regulations: Regulation[] = [
  { cat: 'traffic', reg: 'Saudi Traffic Law', ar: 'نظام المرور', auth: 'BOE / SASO', impl: 'Vehicle type attributes (axle count, gross weight) stored in fleet model; routing logic prevents assignment of prohibited road classes per vehicle type.', status: 'implemented' },
  { cat: 'traffic', reg: 'Driving hours limits', ar: 'حدود ساعات القيادة', auth: 'TGA / PTA', impl: 'Route scheduler enforces 9-hr daily cap and 56-hr weekly cap for commercial drivers; mandatory 45-min rest after 4.5 hrs of continuous driving built into dispatch logic.', status: 'implemented' },
  { cat: 'traffic', reg: 'Vehicle weight limits', ar: 'حدود الأوزان والأبعاد', auth: 'Roads General Authority', impl: 'Fleet capacity parameters capped at legal axle-weight limits (21–45 tons by axle count); overloaded assignments blocked at route-generation stage.', status: 'implemented' },
  { cat: 'traffic', reg: 'City-level truck/time bans', ar: 'حظر الشاحنات في ساعات الذروة', auth: 'Municipal authorities', impl: 'Configurable no-go zone polygons and vehicle-class time windows per city; Makkah peak-hour truck ban pre-loaded as default constraint.', status: 'implemented' },
  { cat: 'delivery', reg: 'TGA Delivery App registration', ar: 'تسجيل التطبيق لدى هيئة النقل', auth: 'TGA', impl: "Platform architecture designed to meet TGA 'Delivery Applications' category requirements; registration process initiated with TGA portal.", status: 'planned' },
  { cat: 'delivery', reg: 'Driver identity verification', ar: 'التحقق من هوية السائق', auth: 'TGA', impl: "Driver login flow includes facial-recognition identity check before shift start, fulfilling TGA's mandatory verification requirement for delivery apps.", status: 'planned' },
  { cat: 'delivery', reg: 'National Address requirement', ar: 'اشتراط العنوان الوطني (يناير 2026)', auth: 'TGA / SPL', impl: 'Address capture enforces valid National Address field for all shipments; back-end validates format against SPL/Absher schema before order acceptance.', status: 'implemented' },
  { cat: 'delivery', reg: 'Parcel delivery licensing', ar: 'ترخيص نقل الطرود البريدية', auth: 'TGA / Postal Regulatory Commission', impl: 'All integrated carriers verified to hold active TGA and postal licenses; platform terms clearly define intermediary (software) role to avoid unlicensed operator liability.', status: 'implemented' },
  { cat: 'arabic', reg: 'National Arabic Language Policy', ar: 'السياسة الوطنية للغة العربية (قرار 588)', auth: 'Council of Ministers', impl: 'Full Arabic UI across customer app, driver app, and merchant dashboard; all legal texts professionally translated into Arabic as primary language.', status: 'implemented' },
  { cat: 'arabic', reg: 'ZATCA e-invoicing (Arabic)', ar: 'اشتراط الفاتورة الإلكترونية بالعربية', auth: 'ZATCA', impl: 'All invoices and credit/debit notes generated with Arabic human-readable fields; supports Arabic and Hindi numerals per ZATCA detailed e-invoicing guideline v2.', status: 'implemented' },
  { cat: 'arabic', reg: 'Basic Law of Governance', ar: 'النظام الأساسي للحكم (المادة 1)', auth: 'BOE', impl: 'Arabic set as primary language system-wide; all official communications, contract terms, and mandatory disclosures available in Arabic before any other language.', status: 'implemented' },
  { cat: 'arabic', reg: 'Consumer invoice requirements', ar: 'متطلبات فاتورة المستهلك', auth: 'Ministry of Commerce', impl: 'Receipts and order confirmations include Arabic invoice number, business name, date, product description, and total with VAT — aligned with MCI consumer-rights guidance.', status: 'implemented' },
  { cat: 'data', reg: 'PDPL – data collection & consent', ar: 'نظام حماية البيانات الشخصية – الموافقة', auth: 'SDAIA', impl: 'Explicit consent prompts at onboarding; privacy policy explains processing purposes, legal bases, data-sharing with carriers, retention periods, and data-subject rights under PDPL.', status: 'implemented' },
  { cat: 'data', reg: 'PDPL – location & courier tracking', ar: 'بيانات الموقع ورصد السائق', auth: 'SDAIA', impl: 'Real-time location data classified as personal data; AES-256 encryption in transit and at rest; role-based access controls; data minimization applied to location history retention.', status: 'implemented' },
  { cat: 'data', reg: 'PDPL – data subject rights', ar: 'حقوق صاحب البيانات', auth: 'SDAIA / NDMO', impl: 'In-app portal for access, correction, and deletion requests; all requests logged with timestamps for SDAIA audit readiness; 30-day response SLA per PDPL.', status: 'implemented' },
  { cat: 'data', reg: 'PDPL – cross-border transfer', ar: 'نقل البيانات عبر الحدود', auth: 'SDAIA', impl: 'Cloud hosting adequacy assessment underway; contractual safeguards in place for non-KSA data centers; primary delivery data earmarked for KSA-region hosting.', status: 'planned' },
];

const categoryStyles: Record<Category, { pill: string; label: string; labelAr: string }> = {
  traffic: { pill: 'bg-blue-100 text-blue-700', label: 'Traffic', labelAr: 'المرور' },
  delivery: { pill: 'bg-teal-100 text-teal-700', label: 'Delivery', labelAr: 'التوصيل' },
  arabic: { pill: 'bg-amber-100 text-amber-700', label: 'Arabic', labelAr: 'العربية' },
  data: { pill: 'bg-purple-100 text-purple-700', label: 'Data', labelAr: 'البيانات' },
};

type FilterKey = 'all' | Category;

export function CompliancePage() {
  const { t, isRTL, language } = useLanguage();
  const [filter, setFilter] = React.useState<FilterKey>('all');

  const filtered = filter === 'all' ? regulations : regulations.filter(r => r.cat === filter);
  const total = regulations.length;
  const implemented = regulations.filter(r => r.status === 'implemented').length;
  const planned = regulations.filter(r => r.status === 'planned').length;

  const filterTabs: { key: FilterKey; labelKey: string }[] = [
    { key: 'all', labelKey: 'compliance.filter.all' },
    { key: 'traffic', labelKey: 'compliance.filter.traffic' },
    { key: 'delivery', labelKey: 'compliance.filter.delivery' },
    { key: 'arabic', labelKey: 'compliance.filter.arabic' },
    { key: 'data', labelKey: 'compliance.filter.data' },
  ];

  return (
    <div className={`p-8 ${isRTL ? 'text-right' : ''}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{t('compliance.title')}</h1>
        <p className="text-gray-600">{t('compliance.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label={t('compliance.stat.total')}
          value={total}
          icon={<FileText className="w-6 h-6 text-gray-700" />}
          color="bg-gray-100"
          isRTL={isRTL}
        />
        <StatCard
          label={t('compliance.stat.implemented')}
          value={implemented}
          icon={<CheckCircle2 className="w-6 h-6 text-green-700" />}
          color="bg-green-100"
          isRTL={isRTL}
        />
        <StatCard
          label={t('compliance.stat.planned')}
          value={planned}
          icon={<Clock className="w-6 h-6 text-amber-700" />}
          color="bg-amber-100"
          isRTL={isRTL}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6 p-2 flex flex-wrap gap-1">
        {filterTabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th isRTL={isRTL}>{t('compliance.col.regulation')}</Th>
                <Th isRTL={isRTL}>{t('compliance.col.authority')}</Th>
                <Th isRTL={isRTL}>{t('compliance.col.implementation')}</Th>
                <Th isRTL={isRTL}>{t('compliance.col.status')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((r, idx) => {
                const cat = categoryStyles[r.cat];
                const catLabel = language === 'ar' ? cat.labelAr : cat.label;
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 align-top">
                      <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cat.pill}`}>
                          {catLabel}
                        </span>
                        <div className={isRTL ? 'text-right' : ''}>
                          <p className="text-sm font-medium text-gray-900">{r.reg}</p>
                          <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{r.ar}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 align-top text-sm text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      {r.auth}
                    </td>
                    <td className={`px-6 py-4 align-top text-sm text-gray-600 max-w-md ${isRTL ? 'text-right' : ''}`}>
                      {r.impl}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <StatusBadge status={r.status} t={t} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  isRTL,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isRTL?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1">
          <p className={`text-sm text-gray-600 mb-1 ${isRTL ? 'text-right' : ''}`}>{label}</p>
          <h3 className="text-3xl font-semibold text-gray-900">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status, t }: { status: Status; t: (k: string) => string }) {
  if (status === 'implemented') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t('compliance.status.implemented')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <Clock className="w-3.5 h-3.5" />
      {t('compliance.status.planned')}
    </span>
  );
}

function Th({ children, isRTL }: { children: React.ReactNode; isRTL?: boolean }) {
  return (
    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}
