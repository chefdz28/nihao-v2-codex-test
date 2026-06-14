import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { markCompleted, unmarkCompleted, isCompleted, type ContentType } from '@/lib/studentProgress';
import { trackEvent } from '@/lib/analytics';

/**
 * V2.9B — shared "mark complete" control for stories, dialogues, lessons, daily.
 * Logged in → writes to Supabase student_progress. Guest → localStorage, plus a
 * gentle "sign in to save your progress" prompt. No voice/audio involved.
 */
export default function MarkComplete({ type, slug, score }: { type: ContentType; slug: string; score?: number }) {
  const { isAuthenticated } = useAuth();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const c = await isCompleted(type, slug);
      if (active) setDone(c);
    })();
    return () => { active = false; };
  }, [type, slug]);

  const toggle = async () => {
    setBusy(true);
    if (done) { await unmarkCompleted(type, slug); setDone(false); }
    else {
      await markCompleted(type, slug, score);
      setDone(true);
      const evt = type === 'lesson' ? 'complete_lesson'
        : type === 'dialogue' ? 'complete_dialogue'
        : type === 'daily' ? 'complete_daily'
        : type === 'story' ? 'complete_story'
        : 'complete_content';
      trackEvent(evt, { content_type: type, content_slug: slug });
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col items-center gap-2" dir="rtl">
      <button
        onClick={toggle}
        disabled={busy}
        className={`text-sm py-2.5 px-6 rounded-xl font-display font-bold transition-colors flex items-center gap-2 disabled:opacity-60 ${
          done ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30' : 'bg-[#FF3333] text-white hover:bg-[#ff5555]'
        }`}
      >
        {done ? <><Check size={15} /> تم إكماله</> : <><Circle size={15} /> علّم كمكتمل</>}
      </button>
      {done && (
        <button onClick={toggle} disabled={busy} className="text-xs font-arabic text-[#a0a0a0] hover:text-white transition-colors">
          إلغاء الإكمال
        </button>
      )}
      {!isAuthenticated && (
        <Link to="/login" className="text-[11px] font-arabic text-[#6ea8fe] hover:underline flex items-center gap-1">
          <LogIn size={11} /> سجّل الدخول لحفظ تقدمك
        </Link>
      )}
    </div>
  );
}
