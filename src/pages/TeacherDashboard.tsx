import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Trash2, Download, ArrowLeft, X, GraduationCap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchTeacherStudents, fetchTeacherStudentProgress, addTeacherStudent, removeTeacherStudent,
  toCsv, downloadCsv, type TeacherStudent, type TeacherProgressRow, type AddStudentResult,
} from '@/lib/teacherData';
import { trackEvent } from '@/lib/analytics';
import Seo from '@/components/Seo';

const ADD_MSG: Record<AddStudentResult, string> = {
  linked: 'تم ربط الطالب بنجاح ✅',
  not_found: 'لا يوجد حساب بهذا البريد. تأكد أن الطالب سجّل أولاً.',
  self: 'لا يمكنك إضافة نفسك كطالب.',
  not_teacher: 'حسابك ليس حساب معلّم.',
  error: 'تعذّر ربط الطالب. حاول مرة أخرى.',
};

const TYPE_LABEL: Record<string, string> = {
  lesson: 'درس', quiz: 'اختبار', story: 'قصة', daily: 'يومي', dialogue: 'حوار',
};
const SLUG_LABEL: Record<string, string> = {
  'hsk1-sim': 'محاكاة HSK1', 'hsk2-sim': 'محاكاة HSK2', 'hsk3-sim': 'محاكاة HSK3',
};

/** V3.9 /teacher-dashboard — teacher sees & manages their own linked students. */
export default function TeacherDashboard() {
  const { isTeacher, isAdmin, isAuthenticated } = useAuth();
  const [rows, setRows] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<TeacherStudent | null>(null);
  const [detail, setDetail] = useState<TeacherProgressRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchTeacherStudents();
    setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    trackEvent('teacher_dashboard_view', {});
    queueMicrotask(() => { void load(); });
  }, [load]);

  const onAdd = async () => {
    if (!email.trim()) return;
    setAdding(true); setNotice('');
    const res = await addTeacherStudent(email.trim());
    setNotice(ADD_MSG[res]);
    trackEvent('teacher_add_student', { result: res });
    if (res === 'linked') { setEmail(''); await load(); }
    setAdding(false);
  };

  const onRemove = async (s: TeacherStudent) => {
    await removeTeacherStudent(s.student_id);
    trackEvent('teacher_remove_student', {});
    if (selected?.student_id === s.student_id) setSelected(null);
    await load();
  };

  const openDetail = async (s: TeacherStudent) => {
    setSelected(s); setDetailLoading(true); setDetail([]);
    const d = await fetchTeacherStudentProgress(s.student_id, 100);
    setDetail(d);
    setDetailLoading(false);
    trackEvent('teacher_view_student', {});
  };

  const exportCsv = () => {
    if (rows.length === 0) return;
    const csv = toCsv(rows as unknown as Record<string, unknown>[]);
    downloadCsv('teacher-students.csv', csv);
    trackEvent('teacher_export_csv', { count: rows.length });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-[640px] mx-auto px-6 py-16 text-center" dir="rtl">
        <Seo />
        <h1 className="font-display font-black text-2xl text-white mb-3">لوحة المعلّم</h1>
        <p className="font-arabic mb-6" style={{ color: 'var(--color-text-secondary)' }}>سجّل الدخول بحساب معلّم للوصول إلى لوحة المعلّم.</p>
        <Link to="/login" className="btn-primary px-6 py-3 font-arabic">تسجيل الدخول</Link>
      </div>
    );
  }

  if (!isTeacher && !isAdmin) {
    return (
      <div className="max-w-[640px] mx-auto px-6 py-16 text-center" dir="rtl">
        <Seo />
        <div className="w-14 h-14 rounded-2xl bg-[#FF3333]/15 flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={26} className="text-[#FF3333]" />
        </div>
        <h1 className="font-display font-black text-2xl text-white mb-3">لوحة المعلّم</h1>
        <p className="font-arabic mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          هذه اللوحة مخصّصة لحسابات المعلّمين. حسابك حالياً حساب طالب.
        </p>
        <p className="font-arabic text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          لإنشاء حساب معلّم، سجّل حساباً جديداً واختر «معلّم» عند التسجيل.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[920px] mx-auto px-6 py-10" dir="rtl">
      <Seo />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FF3333]/15 flex items-center justify-center">
            <Users size={22} className="text-[#FF3333]" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-white">لوحة المعلّم</h1>
            <p className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>تابع طلابك وتقدّمهم</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-secondary text-xs py-2 px-3 font-arabic inline-flex items-center gap-1.5"><RefreshCw size={14} /> تحديث</button>
          <button onClick={exportCsv} disabled={rows.length === 0} className="btn-secondary text-xs py-2 px-3 font-arabic inline-flex items-center gap-1.5 disabled:opacity-40"><Download size={14} /> CSV</button>
        </div>
      </div>

      {/* add student */}
      <div className="liquid-glass rounded-2xl p-5 mb-6">
        <h2 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-1.5 font-arabic"><UserPlus size={16} className="text-[#FF3333]" /> إضافة طالب</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onAdd(); }}
            placeholder="بريد الطالب الإلكتروني"
            aria-label="بريد الطالب"
            className="flex-1 min-w-[200px] bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-arabic focus:border-[#FF3333]/40"
            style={{ direction: 'ltr', textAlign: 'left' }}
          />
          <button onClick={onAdd} disabled={adding || !email.trim()} className="btn-primary text-sm py-2.5 px-5 font-arabic disabled:opacity-50">{adding ? '...' : 'ربط'}</button>
        </div>
        {notice && <p className="text-xs font-arabic mt-2" style={{ color: 'var(--color-text-secondary)' }}>{notice}</p>}
        <p className="text-[11px] font-arabic mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
          ملاحظة: لازم يكون الطالب مسجّلاً في NiHao أولاً حتى تقدر تربطه.
        </p>
      </div>

      {/* students list */}
      {loading ? (
        <p className="text-center font-arabic py-10" style={{ color: 'var(--color-text-tertiary)' }}>جارٍ التحميل…</p>
      ) : rows.length === 0 ? (
        <div className="text-center py-12">
          <Users size={32} className="mx-auto mb-3 text-[#444]" />
          <p className="font-arabic" style={{ color: 'var(--color-text-secondary)' }}>لا يوجد طلاب مرتبطون بعد. أضف طالباً ببريده الإلكتروني للبدء.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(s => (
            <div key={s.student_id} className="liquid-glass rounded-xl p-4 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <p className="font-display font-bold text-white text-sm">{s.display_name || s.email}</p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)', direction: 'ltr', textAlign: 'right' }}>{s.email}</p>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div><p className="font-display font-bold text-white text-sm">{s.total_done}</p><p className="text-[10px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>إجمالي</p></div>
                <div><p className="font-display font-bold text-white text-sm">{s.quiz_done}</p><p className="text-[10px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>اختبارات</p></div>
                <div><p className="font-display font-bold text-white text-sm">{s.lessons_done}</p><p className="text-[10px] font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>دروس</p></div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => openDetail(s)} className="btn-secondary text-xs py-1.5 px-3 font-arabic">عرض</button>
                <button onClick={() => onRemove(s)} aria-label="إزالة" className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-[#FF3333]/15 flex items-center justify-center transition-colors"><Trash2 size={14} className="text-[#FF6666]" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-[560px] max-h-[80vh] overflow-y-auto p-5" dir="rtl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-white">{selected.display_name || selected.email}</h3>
                <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)', direction: 'ltr' }}>{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="إغلاق" className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/10 flex items-center justify-center"><X size={16} className="text-white" /></button>
            </div>
            {detailLoading ? (
              <p className="text-center font-arabic py-8" style={{ color: 'var(--color-text-tertiary)' }}>جارٍ التحميل…</p>
            ) : detail.length === 0 ? (
              <p className="text-center font-arabic py-8" style={{ color: 'var(--color-text-secondary)' }}>لا يوجد نشاط مسجّل لهذا الطالب بعد.</p>
            ) : (
              <div className="space-y-1.5">
                {detail.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF3333]/10 text-[#FF6666] font-arabic">{TYPE_LABEL[d.content_type] || d.content_type}</span>
                      <span className="text-xs font-arabic text-white">{SLUG_LABEL[d.content_slug] || d.content_slug}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {d.score != null && <span className="text-xs font-display font-bold text-white">{d.score}</span>}
                      <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>{d.completed_at ? new Date(d.completed_at).toLocaleDateString('ar') : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-arabic text-[#FF6666] mt-6"><ArrowLeft size={15} /> لوحتي</Link>
    </div>
  );
}
