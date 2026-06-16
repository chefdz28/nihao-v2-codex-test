import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Search, ArrowLeft, Download } from 'lucide-react';
import { fetchAdminLeads, toCsv, downloadCsv, type AdminLead } from '@/lib/adminData';
import { trackEvent } from '@/lib/analytics';

/** V3.4.2 /admin/leads — admin-only email/newsletter leads. */
export default function AdminLeads() {
  const [rows, setRows] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAdminLeads();
        setRows(data);
        trackEvent('admin_leads_view', { section: 'leads', count: data.length });
      } catch {
        setError('تعذّر تحميل البريد. تأكد أنك أدمن وأن قاعدة البيانات محدّثة.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sources = useMemo(() => Array.from(new Set(rows.map(r => r.source_type).filter(Boolean))) as string[], [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => {
      if (sourceFilter !== 'all' && r.source_type !== sourceFilter) return false;
      if (!needle) return true;
      return r.email.toLowerCase().includes(needle);
    });
  }, [rows, q, sourceFilter]);

  const exportCsv = () => {
    downloadCsv('nihao-email-leads.csv', toCsv(filtered as unknown as Record<string, unknown>[], ['email', 'source_path', 'source_type', 'consent', 'created_at']));
    trackEvent('admin_export_csv', { section: 'leads', count: filtered.length });
  };

  const fmt = (d: string) => d ? new Date(d).toISOString().slice(0, 16).replace('T', ' ') : '—';

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <Mail size={22} className="text-[#FF3333]" /> البريد والقائمة البريدية ({filtered.length})
        </h1>
        <Link to="/admin/data" className="text-xs font-arabic text-[#a0a0a0] hover:text-white flex items-center gap-1"><ArrowLeft size={13} /> مركز البيانات</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث بالبريد"
            className="w-full bg-[#161616] border border-white/10 rounded-xl ps-3 pe-9 py-2 text-sm text-white outline-none" style={{ direction: 'ltr' }} />
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-arabic">
          <option value="all">كل المصادر</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={exportCsv} className="btn-secondary text-xs py-2 px-3 inline-flex"><Download size={13} /> تصدير CSV</button>
      </div>

      {loading ? (
        <p className="font-arabic text-sm text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>جارٍ التحميل…</p>
      ) : error ? (
        <p className="font-arabic text-sm text-[#FF3333] text-center py-10">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="font-arabic text-sm text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>لا يوجد بريد بعد.</p>
      ) : (
        <div className="overflow-x-auto liquid-glass rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#888] text-xs border-b border-white/10">
                <th className="text-right p-3 font-arabic">البريد</th>
                <th className="text-center p-3 font-arabic">المصدر</th>
                <th className="text-center p-3 font-arabic">الصفحة</th>
                <th className="text-center p-3 font-arabic">الموافقة</th>
                <th className="text-center p-3 font-arabic">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3 text-white" style={{ direction: 'ltr', textAlign: 'right' }}>{r.email}</td>
                  <td className="text-center p-3 text-xs text-[#a0a0a0] font-arabic">{r.source_type || '—'}</td>
                  <td className="text-center p-3 text-xs text-[#a0a0a0]">{r.source_path || '—'}</td>
                  <td className="text-center p-3">{r.consent ? <span className="text-[#10b981]">✓</span> : <span className="text-[#FF3333]">✗</span>}</td>
                  <td className="text-center p-3 text-xs text-[#a0a0a0]">{fmt(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
