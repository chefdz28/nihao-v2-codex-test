import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Award, ClipboardList, Check } from 'lucide-react';
import {
  fetchStudentAssignments, createAssignment, deleteAssignment,
  fetchStudentFeedback, giveFeedback,
  type Assignment, type Feedback,
} from '@/lib/teacherData';
import { trackEvent } from '@/lib/analytics';

// quick presets so a teacher can assign a known tool in one tap
const PRESETS: { label: string; title: string; type: string; ref: string }[] = [
  { label: 'محاكاة HSK1', title: 'أكمل محاكاة HSK1', type: 'sim', ref: '/hsk1-simulation' },
  { label: 'محاكاة HSK2', title: 'أكمل محاكاة HSK2', type: 'sim', ref: '/hsk2-simulation' },
  { label: 'محاكاة HSK3', title: 'أكمل محاكاة HSK3', type: 'sim', ref: '/hsk3-simulation' },
  { label: 'درس اليوم', title: 'أكمل درس اليوم', type: 'lesson', ref: '/daily' },
  { label: 'كتابة', title: 'تدرّب على الكتابة', type: 'lesson', ref: '/writing-practice' },
  { label: 'القاموس', title: 'راجع كلمات من القاموس', type: 'words', ref: '/dictionary' },
];

/** V3.10 — inside the teacher's student drawer: assign tasks + grant points. */
export default function TeacherStudentManage({ studentId }: { studentId: string }) {
  const [tab, setTab] = useState<'assign' | 'points'>('assign');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [title, setTitle] = useState('');
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [points, setPoints] = useState('10');
  const [fbNote, setFbNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const [a, f] = await Promise.all([fetchStudentAssignments(studentId), fetchStudentFeedback(studentId)]);
    setAssignments(a); setFeedback(f);
  }, [studentId]);

  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  const addAssignment = async (preset?: typeof PRESETS[number]) => {
    const t = preset ? preset.title : title.trim();
    if (!t) { setMsg('اكتب عنوان الواجب أولاً.'); return; }
    setBusy(true); setMsg('');
    const res = await createAssignment({
      studentId, title: t,
      contentType: preset ? preset.type : 'custom',
      contentRef: preset ? preset.ref : (ref.trim() || null),
      note: preset ? null : (note.trim() || null),
    });
    trackEvent('teacher_create_assignment', { result: res });
    if (res === 'created') { setTitle(''); setRef(''); setNote(''); setMsg('تمت إضافة الواجب ✅'); await load(); }
    else setMsg(res === 'not_linked' ? 'الطالب غير مرتبط بك.' : 'تعذّر إضافة الواجب.');
    setBusy(false);
  };

  const removeAssignment = async (id: string) => {
    await deleteAssignment(id);
    trackEvent('teacher_delete_assignment', {});
    await load();
  };

  const submitPoints = async () => {
    const p = parseInt(points, 10);
    if (isNaN(p)) { setMsg('أدخل عدد نقاط صحيح.'); return; }
    setBusy(true); setMsg('');
    const res = await giveFeedback(studentId, p, fbNote.trim() || null);
    trackEvent('teacher_give_feedback', { result: res });
    if (res === 'saved') { setFbNote(''); setMsg('تم منح النقاط ✅'); await load(); }
    else setMsg('تعذّر منح النقاط.');
    setBusy(false);
  };

  const totalPoints = feedback.reduce((s, f) => s + (f.points || 0), 0);

  return (
    <div className="mt-4 pt-4 border-t border-white/10" dir="rtl">
      {/* tabs */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => setTab('assign')} className={`text-xs font-arabic px-3 py-1.5 rounded-full border transition-colors ${tab === 'assign' ? 'bg-[#FF3333] text-white border-[#FF3333]' : 'bg-white/[0.03] text-white border-white/10'}`}>
          <ClipboardList size={12} className="inline ms-1" /> الواجبات
        </button>
        <button onClick={() => setTab('points')} className={`text-xs font-arabic px-3 py-1.5 rounded-full border transition-colors ${tab === 'points' ? 'bg-[#FF3333] text-white border-[#FF3333]' : 'bg-white/[0.03] text-white border-white/10'}`}>
          <Award size={12} className="inline ms-1" /> النقاط {totalPoints > 0 && `(${totalPoints})`}
        </button>
      </div>

      {tab === 'assign' ? (
        <div>
          {/* presets */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PRESETS.map(p => (
              <button key={p.ref} onClick={() => addAssignment(p)} disabled={busy} className="text-[11px] font-arabic px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-white hover:border-[#FF3333]/30 disabled:opacity-50">
                + {p.label}
              </button>
            ))}
          </div>
          {/* custom assignment */}
          <div className="space-y-2 mb-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان واجب مخصّص" className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none font-arabic focus:border-[#FF3333]/40" />
            <div className="flex gap-2">
              <input value={ref} onChange={e => setRef(e.target.value)} placeholder="رابط (اختياري) مثل /dictionary" className="flex-1 bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#FF3333]/40" style={{ direction: 'ltr', textAlign: 'left' }} />
              <button onClick={() => addAssignment()} disabled={busy || !title.trim()} className="btn-primary text-xs py-2 px-4 font-arabic disabled:opacity-50"><Plus size={13} className="inline" /> إضافة</button>
            </div>
          </div>
          {/* list */}
          <div className="space-y-1.5">
            {assignments.length === 0 ? (
              <p className="text-xs font-arabic text-center py-3" style={{ color: 'var(--color-text-tertiary)' }}>لا توجد واجبات بعد.</p>
            ) : assignments.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  {a.status === 'done' ? <Check size={14} className="text-[#10b981] shrink-0" /> : <span className="w-2 h-2 rounded-full bg-[#FF6666] shrink-0" />}
                  <span className="text-xs font-arabic text-white truncate">{a.title}</span>
                </div>
                <button onClick={() => removeAssignment(a.id)} aria-label="حذف" className="w-7 h-7 rounded-lg hover:bg-[#FF3333]/15 flex items-center justify-center shrink-0"><Trash2 size={13} className="text-[#FF6666]" /></button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-3">
            <input value={points} onChange={e => setPoints(e.target.value)} type="number" placeholder="نقاط" className="w-20 bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none text-center focus:border-[#FF3333]/40" />
            <input value={fbNote} onChange={e => setFbNote(e.target.value)} placeholder="ملاحظة (اختياري)" className="flex-1 bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none font-arabic focus:border-[#FF3333]/40" />
            <button onClick={submitPoints} disabled={busy} className="btn-primary text-xs py-2 px-4 font-arabic disabled:opacity-50">منح</button>
          </div>
          <div className="space-y-1.5">
            {feedback.length === 0 ? (
              <p className="text-xs font-arabic text-center py-3" style={{ color: 'var(--color-text-tertiary)' }}>لم تمنح نقاطاً بعد.</p>
            ) : feedback.map(f => (
              <div key={f.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                <span className="text-xs font-arabic text-white">{f.note || '—'}</span>
                <span className="text-xs font-display font-bold text-[#10b981] shrink-0">+{f.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {msg && <p className="text-[11px] font-arabic mt-2" style={{ color: 'var(--color-text-secondary)' }}>{msg}</p>}
    </div>
  );
}
