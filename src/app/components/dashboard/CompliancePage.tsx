import React from 'react';
import { CheckCircle2, Clock, FileText, ExternalLink, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/app/i18n/LanguageContext';

type Category = 'traffic' | 'delivery' | 'arabic' | 'data';
type Status = 'implemented' | 'planned';
type ProofAction = { type: 'route'; path: string } | { type: 'toggleLang' };

interface Regulation {
  id: number;
  cat: Category;
  status: Status;
  proof: ProofAction;
  hasNote?: boolean;
}

const regulations: Regulation[] = [
  { id: 1,  cat: 'traffic',  status: 'implemented', proof: { type: 'route', path: '/optimization' } },
  { id: 2,  cat: 'traffic',  status: 'implemented', proof: { type: 'route', path: '/optimization' } },
  { id: 3,  cat: 'traffic',  status: 'implemented', proof: { type: 'route', path: '/settings' } },
  { id: 4,  cat: 'traffic',  status: 'implemented', proof: { type: 'route', path: '/fleet' } },
  { id: 5,  cat: 'delivery', status: 'planned',     proof: { type: 'route', path: '/settings' } },
  { id: 6,  cat: 'delivery', status: 'planned',     proof: { type: 'route', path: '/settings' }, hasNote: true },
  { id: 7,  cat: 'delivery', status: 'implemented', proof: { type: 'route', path: '/fleet' } },
  { id: 8,  cat: 'delivery', status: 'implemented', proof: { type: 'route', path: '/settings' }, hasNote: true },
  { id: 9,  cat: 'arabic',   status: 'implemented', proof: { type: 'toggleLang' },               hasNote: true },
  { id: 10, cat: 'arabic',   status: 'implemented', proof: { type: 'route', path: '/analytics' }, hasNote: true },
  { id: 11, cat: 'arabic',   status: 'implemented', proof: { type: 'toggleLang' },               hasNote: true },
  { id: 12, cat: 'arabic',   status: 'implemented', proof: { type: 'route', path: '/analytics' }, hasNote: true },
  { id: 13, cat: 'data',     status: 'implemented', proof: { type: 'route', path: '/settings' }, hasNote: true },
  { id: 14, cat: 'data',     status: 'implemented', proof: { type: 'route', path: '/fleet' } },
  { id: 15, cat: 'data',     status: 'implemented', proof: { type: 'route', path: '/settings' }, hasNote: true },
  { id: 16, cat: 'data',     status: 'planned',     proof: { type: 'route', path: '/settings' }, hasNote: true },
];

const categoryStyles: Record<Category, { pill: string; labelKey: string }> = {
  traffic:  { pill: 'bg-blue-100 text-blue-700',   labelKey: 'compliance.cat.traffic' },
  delivery: { pill: 'bg-teal-100 text-teal-700',   labelKey: 'compliance.cat.delivery' },
  arabic:   { pill: 'bg-amber-100 text-amber-700', labelKey: 'compliance.cat.arabic' },
  data:     { pill: 'bg-purple-100 text-purple-700', labelKey: 'compliance.cat.data' },
};

type FilterKey = 'all' | Category;

export function CompliancePage() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const [filter, setFilter] = React.useState<FilterKey>('all');

  const filtered = filter === 'all' ? regulations : regulations.filter(r => r.cat === filter);
  const total = regulations.length;
  const implemented = regulations.filter(r => r.status === 'implemented').length;
  const planned = regulations.filter(r => r.status === 'planned').length;

  const filterTabs: { key: FilterKey; labelKey: string }[] = [
    { key: 'all',      labelKey: 'compliance.filter.all' },
    { key: 'traffic',  labelKey: 'compliance.filter.traffic' },
    { key: 'delivery', labelKey: 'compliance.filter.delivery' },
    { key: 'arabic',   labelKey: 'compliance.filter.arabic' },
    { key: 'data',     labelKey: 'compliance.filter.data' },
  ];

  const handleToggleLang = () => setLanguage(language === 'ar' ? 'en' : 'ar');

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
                <Th isRTL={isRTL}>{t('compliance.col.proof')}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((r) => {
                const cat = categoryStyles[r.cat];
                const primaryName = t(`compliance.reg.${r.id}.name`);
                const authority = t(`compliance.reg.${r.id}.authority`);
                const implementation = t(`compliance.reg.${r.id}.implementation`);
                const note = r.hasNote ? t(`compliance.reg.${r.id}.note`) : undefined;

                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 align-top">
                      <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cat.pill}`}>
                          {t(cat.labelKey)}
                        </span>
                        <div className={isRTL ? 'text-right' : ''}>
                          <p className="text-sm font-medium text-gray-900">{primaryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 align-top text-sm text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                      {authority}
                    </td>
                    <td className={`px-6 py-4 align-top text-sm text-gray-600 max-w-md ${isRTL ? 'text-right' : ''}`}>
                      {implementation}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <StatusBadge status={r.status} t={t} />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <ProofButton
                        proof={r.proof}
                        label={
                          r.proof.type === 'toggleLang'
                            ? t('compliance.proof.toggleLang')
                            : t('compliance.proof.view')
                        }
                        title={note}
                        onToggleLang={handleToggleLang}
                      />
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

function ProofButton({
  proof,
  label,
  title,
  onToggleLang,
}: {
  proof: ProofAction;
  label: string;
  title?: string;
  onToggleLang: () => void;
}) {
  const baseClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap';

  if (proof.type === 'toggleLang') {
    return (
      <button
        type="button"
        onClick={onToggleLang}
        title={title}
        className={`${baseClass} bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200`}
      >
        <Languages className="w-3.5 h-3.5" />
        {label}
      </button>
    );
  }

  return (
    <Link
      to={proof.path}
      title={title}
      className={`${baseClass} bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200`}
    >
      <ExternalLink className="w-3.5 h-3.5" />
      {label}
    </Link>
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
