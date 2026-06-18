import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Check, Award, ArrowLeft } from 'lucide-react';
import { fetchMyAssignments, completeMyAssignment, fetchMyFeedback, type MyAssignment, type MyFeedback } from '@/lib/teacherData';
import { trackEvent } from '@/lib/analytics';

/** V3.10 — student's "my assignments + feedback" card on the dashboard.
 *  Renders nothing if the student has no teacher assignments/feedback. */
export default function StudentAssignmentsCard() {
  const [assignments, setAssignments] = useState<MyAssignment[]>([]);
  const [feedback, setFeedback] = useState<MyFeedback[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [a, f] = await Promise.all([fetchMyAssignments(), fetchMyFeedback()]);
    setAssignments(a); setFeedback(f); setLoaded(true);
  }, []);

  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  const markDone = async (id: string) => {
    await completeMyAssignment(id);
    trackEvent('student_complete_assignment', {});
    await load();
  };

  // hide entirely until loaded, and if there's nothing to show
  if (!loaded || (assignments.length === 0 && feedback.length === 0)) return null;

  const totalPoints = feedback.reduce((s, f) => s + (f.points || 0), 0);
  const pending = assignments.filter(a => a.status !== 'done');

  return (
    <div className="liquid-glass rounded-2xl p-5 mb-6" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-white text-sm flex items-center gap-1.5 font-arabic">
          <ClipboardList size={16} className="text-[#FF3333]" /> واجباتي من المعلّم
        </h2>
        {totalPoints > 0 && (
          <span className="flex items-center gap-1 text-xs font-display font-bold text-[#10b981]">
            <Award size={14} /> {totalPoints} نقطة
          </span>
        )}
      </div>

      {/* assignments */}
      {assignments.length === 0 ? (
        <p className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>لا توجد واجبات حالياً.</p>
      ) : (
        <div className="space-y-1.5">
          {assignments.map(a => (
            <div key={a.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                {a.status === 'done'
                  ? <Check size={15} className="text-[#10b981] shrink-0" />
                  : <span className="w-2 h-2 rounded-full bg-[#FF6666] shrink-0" />}
                <div className="min-w-0">
                  <p className={`text-xs font-arabic truncate ${a.status === 'done' ? 'text-[#888] line-through' : 'text-white'}`}>{a.title}</p>
                  {a.teacher_name && <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>من: {a.teacher_name}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {a.content_ref && (
                  <Link to={a.content_ref} className="text-[11px] font-arabic text-[#FF6666] inline-flex items-center gap-0.5">افتح <ArrowLeft size={11} /></Link>
                )}
                {a.status !== 'done' && (
                  <button onClick={() => markDone(a.id)} className="text-[11px] font-arabic px-2 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] hover:bg-[#10b981]/25 transition-colors">تم</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* feedback notes */}
      {feedback.some(f => f.note) && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
          {feedback.filter(f => f.note).slice(0, 3).map(f => (
            <div key={f.id} className="flex items-center justify-between">
              <span className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{f.note}</span>
              {f.points > 0 && <span className="text-xs font-display font-bold text-[#10b981] shrink-0">+{f.points}</span>}
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <p className="text-[11px] font-arabic mt-3" style={{ color: 'var(--color-text-tertiary)' }}>لديك {pending.length} واجب غير مكتمل.</p>
      )}
    </div>
  );
}
