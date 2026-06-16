import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ArrowLeft, Download } from 'lucide-react';
import { fetchAdminStudents, toCsv, downloadCsv, type AdminStudent } from '@/lib/adminData';
import { trackEvent } from '@/lib/analytics';

type SortKey = 'newest' | 'active' | 'xp';

/** V3.4.2 /admin/students — admin-only student directory. */
export default function AdminStudents() {
  const [rows, setRows] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | 'google' | 'email'>('all');
  const [sort, setSort] = useState<SortKey>('newest');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAdminStudents();
        setRows(data);
        trackEvent('admin_students_view', { section: 'students', count: data.length });
      } catch {
        setError('تعذّر تحميل بيانات الطلاب. تأكد أنك أدمن وأن قاعدة البيانات محدّثة.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = rows.filter(s => {
      if (roleFilter !== 'all' && s.role !== roleFilter) return false;
      if (providerFilter !== 'all' && (s.provider || 'email') !== providerFilter) return false;
      if (!needle) return true;
      return (s.email || '').toLowerCase().includes(needle)
        || (s.display_name || '').toLowerCase().includes(needle)
        || s.user_id.toLowerCase().includes(needle);
    });
    r = [...r].sort((a, b) => {
      if (sort === 'xp' || sort === 'active') return b.total_done - a.total_done;
      return (b.joined_at || '').localeCompare(a.joined_at || '');
    });
    return r;
  }, [rows, q, roleFilter, providerFilter, sort]);

  const exportCsv = () => {
    const cols = ['user_id', 'email', 'display_name', 'provider', 'role', 'joined_at', 'last_activity', 'lessons_done', 'dialogues_done', 'stories_done', 'daily_done', 'quiz_done', 'total_done', 'latest_content'];
    downloadCsv('nihao-students.csv', toCsv(filtered as unknown as Record<string, unknown>[], cols));
    trackEvent('admin_export_csv', { section: 'students', count: filtered.length });
  };

  const fmt = (d: string | null) => d ? new Date(d).toISOString().slice(0, 10) : '—';

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <Users size={22} className="text-[#FF3333]" /> الطلاب ({filtered.length})
        </h1>
        <Link to="/admin/data" className="text-xs font-arabic text-[#a0a0a0] hover:text-white flex items-center gap-1"><ArrowLeft size={13} /> مركز البيانات</Link>
      </div>

      {/* controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث بالبريد أو الاسم أو المعرّف"
            className="w-full bg-[#161616] border border-white/10 rounded-xl ps-3 pe-9 py-2 text-sm text-white outline-none font-arabic" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as 'all' | 'admin' | 'student')} className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-arabic">
          <option value="all">كل الأدوار</option><option value="admin">أدمن</option><option value="student">طالب</option>
        </select>
        <select value={providerFilter} onChange={e => setProviderFilter(e.target.value as 'all' | 'google' | 'email')} className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-arabic">
          <option value="all">كل الطرق</option><option value="google">Google</option><option value="email">بريد</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className="bg-[#161616] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-arabic">
          <option value="newest">الأحدث</option><option value="active">الأكثر نشاطاً</option>
        </select>
        <button onClick={exportCsv} className="btn-secondary text-xs py-2 px-3 inline-flex"><Download size={13} /> CSV</button>
      </div>

      {loading ? (
        <p className="font-arabic text-sm text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>جارٍ التحميل…</p>
      ) : error ? (
        <p className="font-arabic text-sm text-[#FF3333] text-center py-10">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="font-arabic text-sm text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>لا توجد نتائج.</p>
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden md:block overflow-x-auto liquid-glass rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#888] text-xs border-b border-white/10">
                  <th className="text-right p-3 font-arabic">البريد / الاسم</th>
                  <th className="text-center p-3 font-arabic">الطريقة</th>
                  <th className="text-center p-3 font-arabic">الدور</th>
                  <th className="text-center p-3 font-arabic">انضم</th>
                  <th className="text-center p-3 font-arabic">آخر نشاط</th>
                  <th className="text-center p-3 font-arabic">دروس</th>
                  <th className="text-center p-3 font-arabic">حوارات</th>
                  <th className="text-center p-3 font-arabic">اختبارات</th>
                  <th className="text-center p-3 font-arabic">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.user_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3">
                      <span className="text-white block" style={{ direction: 'ltr', textAlign: 'right' }}>{s.email || '—'}</span>
                      {s.display_name && <span className="text-xs text-[#888] font-arabic">{s.display_name}</span>}
                    </td>
                    <td className="text-center p-3 text-xs text-[#a0a0a0]">{s.provider === 'google' ? 'Google' : 'بريد'}</td>
                    <td className="text-center p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-arabic ${s.role === 'admin' ? 'bg-[#FF3333]/15 text-[#FF3333]' : 'bg-white/5 text-[#a0a0a0]'}`}>{s.role === 'admin' ? 'أدمن' : 'طالب'}</span></td>
                    <td className="text-center p-3 text-xs text-[#a0a0a0]">{fmt(s.joined_at)}</td>
                    <td className="text-center p-3 text-xs text-[#a0a0a0]">{fmt(s.last_activity)}</td>
                    <td className="text-center p-3 text-white">{s.lessons_done}</td>
                    <td className="text-center p-3 text-white">{s.dialogues_done}</td>
                    <td className="text-center p-3 text-white">{s.quiz_done}</td>
                    <td className="text-center p-3 font-bold text-[#FF3333]">{s.total_done}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(s => (
              <div key={s.user_id} className="liquid-glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm" style={{ direction: 'ltr' }}>{s.email || s.user_id.slice(0, 8)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-arabic ${s.role === 'admin' ? 'bg-[#FF3333]/15 text-[#FF3333]' : 'bg-white/5 text-[#a0a0a0]'}`}>{s.role === 'admin' ? 'أدمن' : 'طالب'}</span>
                </div>
                {s.display_name && <p className="text-xs text-[#888] font-arabic mb-2">{s.display_name}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span>{s.provider === 'google' ? 'Google' : 'بريد'}</span>
                  <span>انضم: {fmt(s.joined_at)}</span>
                  <span>دروس: {s.lessons_done}</span>
                  <span>اختبارات: {s.quiz_done}</span>
                  <span className="text-[#FF3333]">الإجمالي: {s.total_done}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
