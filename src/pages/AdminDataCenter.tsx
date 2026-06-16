import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Users, Activity, ClipboardList, Mail, FileText, ArrowLeft } from 'lucide-react';
import { fetchAdminOverview, type AdminOverview } from '@/lib/adminData';
import { trackEvent } from '@/lib/analytics';

const CARDS = [
  { path: '/admin/students', label: 'الطلاب', en: 'Students', icon: Users, desc: 'كل المسجّلين، أدوارهم، ونشاطهم' },
  { path: '/admin/progress', label: 'التقدّم', en: 'Progress', icon: Activity, desc: 'إنجازات الدروس والحوارات والقصص' },
  { path: '/admin/quiz-results', label: 'نتائج الاختبارات', en: 'Quiz Results', icon: ClipboardList, desc: 'نتائج الاختبارات على الخادم' },
  { path: '/admin/leads', label: 'البريد والقائمة', en: 'Email Leads', icon: Mail, desc: 'المشتركون في النشرة البريدية' },
  { path: '/admin/content-drafts', label: 'المسودات', en: 'Content Drafts', icon: FileText, desc: 'مسودات المحتوى' },
];

/** V3.4.2 /admin/data — central admin data dashboard. Admin-only (route guarded). */
export default function AdminDataCenter() {
  const [ov, setOv] = useState<AdminOverview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const o = await fetchAdminOverview();
        setOv(o);
        trackEvent('admin_data_view', { section: 'overview' });
      } catch {
        setError('تعذّر تحميل الإحصائيات. تأكد أنك أدمن وأن قاعدة البيانات محدّثة (migration).');
      }
    })();
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <Database size={22} className="text-[#FF3333]" /> مركز البيانات
        </h1>
        <Link to="/admin" className="text-xs font-arabic text-[#a0a0a0] hover:text-white flex items-center gap-1"><ArrowLeft size={13} /> لوحة الأدمن</Link>
      </div>

      {/* overview */}
      {error ? (
        <p className="font-arabic text-sm text-[#FF3333] mb-6">{error}</p>
      ) : ov && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { n: ov.total_students, l: 'طلاب' },
            { n: ov.total_admins, l: 'أدمن' },
            { n: ov.total_leads, l: 'بريد' },
            { n: ov.total_progress, l: 'إنجازات' },
            { n: ov.completions_today, l: 'اليوم' },
            { n: ov.total_drafts, l: 'مسودات' },
          ].map((s, i) => (
            <div key={i} className="liquid-glass rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-white">{s.n}</p>
              <p className="text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {/* section cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(c => {
          const Icon = c.icon;
          return (
            <Link key={c.path} to={c.path} className="liquid-glass rounded-2xl p-5 hover:border-[#FF3333]/30 border border-transparent transition-colors">
              <Icon size={22} className="text-[#FF3333] mb-3" />
              <h2 className="font-display font-bold text-white mb-1 font-arabic">{c.label}</h2>
              <p className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
