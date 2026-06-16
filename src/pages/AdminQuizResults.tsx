import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Info } from 'lucide-react';
import { fetchAdminProgress, type AdminProgressRow } from '@/lib/adminData';
import { trackEvent } from '@/lib/analytics';

/**
 * V3.4.2 /admin/quiz-results — quiz/test results visible server-side.
 * Server-side results = student_progress rows with content_type 'quiz' (lesson
 * quizzes + any synced test). HSK1/HSK2/HSK3 simulation results are currently
 * stored in the learner's browser localStorage, so they are NOT visible here
 * across devices — clearly stated below (no faked data).
 */
export default function AdminQuizResults() {
  const [rows, setRows] = useState<AdminProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAdminProgress(1000);
        setRows(data.filter(r => r.content_type === 'quiz'));
        trackEvent('admin_data_view', { section: 'quiz_results', count: data.length });
      } catch {
        setError('تعذّر تحميل النتائج. تأكد أنك أدمن وأن قاعدة البيانات محدّثة.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const SLUG_LABEL: Record<string, string> = { 'hsk1-sim': 'محاكاة HSK1', 'hsk2-sim': 'محاكاة HSK2', 'hsk3-sim': 'محاكاة HSK3' };
  const labelSlug = (slug: string) => SLUG_LABEL[slug] || slug;
  const fmt = (d: string | null) => d ? new Date(d).toISOString().slice(0, 10) : '—';
  const sorted = useMemo(() => [...rows].sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || '')), [rows]);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <ClipboardList size={22} className="text-[#FF3333]" /> نتائج الاختبارات ({sorted.length})
        </h1>
        <Link to="/admin/data" className="text-xs font-arabic text-[#a0a0a0] hover:text-white flex items-center gap-1"><ArrowLeft size={13} /> مركز البيانات</Link>
      </div>

      {/* V3.6: HSK simulation results now sync to the server for logged-in users */}
      <div className="liquid-glass rounded-xl p-4 mb-5 flex gap-3" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
        <Info size={18} className="text-[#10b981] shrink-0 mt-0.5" />
        <p className="text-xs font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          نتائج اختبارات الدروس ومحاكاة HSK1/HSK2/HSK3 تُحفظ على الخادم للمستخدمين المسجّلين (نوع «quiz»)،
          فتظهر هنا مركزياً عبر الأجهزة. أما الزوّار غير المسجّلين فتُحفظ نتائجهم محلياً على أجهزتهم فقط
          ولا يمكن عرضها هنا.
        </p>
      </div>

      {loading ? (
        <p className="font-arabic text-sm text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>جارٍ التحميل…</p>
      ) : error ? (
        <p className="font-arabic text-sm text-[#FF3333] text-center py-10">{error}</p>
      ) : sorted.length === 0 ? (
        <p className="font-arabic text-sm text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>
          لا توجد نتائج اختبارات على الخادم بعد. ستظهر هنا عند إكمال المستخدمين المسجّلين للاختبارات.
        </p>
      ) : (
        <div className="overflow-x-auto liquid-glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#888] text-xs border-b border-white/10">
                <th className="text-right p-3 font-arabic">المستخدم</th>
                <th className="text-right p-3 font-arabic">الاختبار</th>
                <th className="text-center p-3 font-arabic">النتيجة</th>
                <th className="text-center p-3 font-arabic">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3 text-xs text-white" style={{ direction: 'ltr', textAlign: 'right' }}>{r.email || r.user_id.slice(0, 10)}</td>
                  <td className="p-3 text-xs text-[#ddd]" style={{ direction: 'ltr', textAlign: 'right' }}>{labelSlug(r.content_slug)}</td>
                  <td className="text-center p-3 text-white">{r.score ?? '—'}</td>
                  <td className="text-center p-3 text-xs text-[#a0a0a0]">{fmt(r.completed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
