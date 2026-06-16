import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Search, ArrowLeft, Download } from 'lucide-react';
import { fetchAdminProgress, toCsv, downloadCsv, type AdminProgressRow } from '@/lib/adminData';
import { trackEvent } from '@/lib/analytics';

const TYPES = ['lesson', 'dialogue', 'story', 'quiz', 'daily'];
const TYPE_AR: Record<string, string> = { lesson: 'درس', dialogue: 'حوار', story: 'قصة', quiz: 'اختبار', daily: 'يومي' };

/** V3.4.2 /admin/progress — admin-only student_progress viewer. */
export default function AdminProgress() {
  const [rows, setRows] = useState<AdminProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAdminProgress(1000);
        setRows(data);
        trackEvent('admin_progress_view', { section: 'progress', count: data.length });
      } catch {
        setError('تعذّر تحميل بيانات التقدّم. تأكد أنك أدمن وأن قاعدة البيانات محدّثة.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => {
      if (typeFilter !== 'all' && r.content_type !== typeFilter) return false;
      if (!needle) return true;
      return (r.email || '').toLowerCase().includes(needle) || r.content_slug.toLowerCase().includes(needle);
    });
  }, [rows, q, typeFilter]);

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = rows.filter(r => (r.completed_at || '').slice(0, 10) === today).length;
    const byContent: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    for (const r of rows) {
      byContent[r.content_slug] = (byContent[r.content_slug] || 0) + 1;
      const u = r.email || r.user_id;
      byUser[u] = (byUser[u] || 0) + 1;
    }
    const topContent = Object.entries(byContent).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const topUsers = Object.entries(byUser).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { total: rows.length, todayCount, topContent, topUsers };
  }, [rows]);

  const exportCsv = () => {
    downloadCsv('nihao-progress.csv', toCsv(filtered as unknown as Record<string, unknown>[], ['user_id', 'email', 'content_type', 'content_slug', 'status', 'score', 'completed_at', 'updated_at']));
    trackEvent('admin_export_csv', { section: 'progress', count: filtered.length });
  };

  const fmt = (d: string | null) => d ? new Date(d).toISOString().slice(0, 10) : '—';

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <Activity size={22} className="text-[#FF3333]" /> التقدّم ({filtered.length})
        </h1>
        <Link to="/admin/data" className="text-xs font-arabic text-[#a0a0a0] hover:text-white flex items-center gap-1"><ArrowLeft size={13} /> مركز البيانات</Link>
      </div>

      {/* summary */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="liquid-glass rounded-xl p-3 text-center"><p className="text-xl font-black text-white">{summary.total}</p><p className="text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>إجمالي الإنجازات</p></div>
          <div className="liquid-glass rounded-xl p-3 text-center"><p className="text-xl font-black text-[#FF3333]">{summary.todayCount}</p><p className="text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>اليوم</p></div>
          <div className="liquid-glass rounded-xl p-3 text-center col-span-1"><p className="text-xs font-arabic text-white truncate">{summary.topContent[0]?.[0] || '—'}</p><p className="text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>الأكثر إنجازاً</p></div>
          <div className="liquid-glass rounded-xl p-3 text-center"><p className="text-xs text-white truncate" style={{ direction: 'ltr' }}>{summary.topUsers[0]?.[0]?.slice(0, 14) || '—'}</p><p className="text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>الأكثر نشاطاً</p></div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث بالبريد أو المحتوى"
            className="w-full bg-[#161616] border border-white/10 rounded-xl ps-3 pe-9 py-2 text-sm text-white outline-none font-arabic" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-arabic">
          <option value="all">كل الأنواع</option>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_AR[t]}</option>)}
        </select>
        <button onClick={exportCsv} className="btn-secondary text-xs py-2 px-3 inline-flex"><Download size={13} /> CSV</button>
      </div>

      {loading ? (
        <p className="font-arabic text-sm text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>جارٍ التحميل…</p>
      ) : error ? (
        <p className="font-arabic text-sm text-[#FF3333] text-center py-10">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="font-arabic text-sm text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>لا توجد بيانات.</p>
      ) : (
        <div className="overflow-x-auto liquid-glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#888] text-xs border-b border-white/10">
                <th className="text-right p-3 font-arabic">المستخدم</th>
                <th className="text-center p-3 font-arabic">النوع</th>
                <th className="text-right p-3 font-arabic">المحتوى</th>
                <th className="text-center p-3 font-arabic">النتيجة</th>
                <th className="text-center p-3 font-arabic">أُنجز</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3 text-xs text-white" style={{ direction: 'ltr', textAlign: 'right' }}>{r.email || r.user_id.slice(0, 10)}</td>
                  <td className="text-center p-3"><span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-[#a0a0a0] font-arabic">{TYPE_AR[r.content_type] || r.content_type}</span></td>
                  <td className="p-3 text-xs text-[#ddd]" style={{ direction: 'ltr', textAlign: 'right' }}>{r.content_slug}</td>
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
