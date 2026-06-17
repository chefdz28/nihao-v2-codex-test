import { Link } from 'react-router-dom';
import { Clock, ListChecks, Volume2, ArrowLeft } from 'lucide-react';
import PinyinText from '@/components/PinyinText';
import { useAudio } from '@/hooks/useAudio';
import { trackEvent } from '@/lib/analytics';
import type { TeacherPlan } from '@/lib/aiTeacher';

/** V3.7 — renders the generated study plan: minutes, steps, 3-word mini lesson,
 *  and recommended internal links. Pinyin visibility is controlled by the parent. */
export default function AiTeacherPlanCard({
  plan,
  showPinyin,
}: {
  plan: TeacherPlan;
  showPinyin: boolean;
}) {
  const { play } = useAudio();

  return (
    <div className="space-y-6" dir="rtl">
      {/* header */}
      <div className="liquid-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-black text-lg text-white">{plan.title}</h2>
          <span className="flex items-center gap-1 text-xs font-arabic shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
            <Clock size={13} /> {plan.recommendedMinutes} دقيقة
          </span>
        </div>
        <ol className="space-y-2">
          {plan.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-arabic text-white">
              <span className="w-5 h-5 rounded-full bg-[#FF3333]/15 text-[#FF3333] text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* mini lesson words */}
      <div className="liquid-glass rounded-2xl p-5">
        <h3 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-1.5 font-arabic">
          <ListChecks size={15} className="text-[#FF3333]" /> كلمات اليوم
        </h3>
        <div className="space-y-3">
          {plan.words.map((w, i) => (
            <div key={i} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
              <button onClick={() => play(w.hanzi)} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0" aria-label={`استمع إلى ${w.hanzi}`}>
                <Volume2 size={15} className="text-[#FF3333]" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-chinese text-xl text-white">{w.hanzi}</span>
                  {showPinyin && <PinyinText className="text-sm">{w.pinyin}</PinyinText>}
                  <span className="font-arabic text-sm" style={{ color: 'var(--color-text-secondary)' }}>{w.ar}</span>
                </div>
                <p className="font-chinese text-sm text-[#bbb] mt-0.5">{w.example}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* recommended internal links */}
      <div className="liquid-glass rounded-2xl p-5">
        <h3 className="font-display font-bold text-white text-sm mb-3 font-arabic">روابط مناسبة لمستواك</h3>
        <div className="flex flex-wrap gap-2">
          {plan.recommendedRoutes.map(r => (
            <Link
              key={r.href}
              to={r.href}
              onClick={() => trackEvent('ai_teacher_recommended_link_click', { href: r.href, level: plan.level, goal: plan.goal })}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs font-arabic text-white hover:border-[#FF3333]/30 transition-colors flex items-center gap-1.5"
            >
              {r.label} <ArrowLeft size={13} className="text-[#FF3333]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
