import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, GraduationCap, Target, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePinyinMode } from '@/hooks/usePinyinMode';
import PinyinToggle from '@/components/PinyinToggle';
import AiTeacherPlanCard from '@/components/AiTeacherPlanCard';
import AiTeacherMiniQuiz from '@/components/AiTeacherMiniQuiz';
import { markCompleted } from '@/lib/studentProgress';
import { trackEvent } from '@/lib/analytics';
import {
  generateTeacherPlan, LEVEL_LABEL, GOAL_LABEL,
  type TeacherLevel, type TeacherGoal, type TeacherPlan,
} from '@/lib/aiTeacher';

const LEVELS: TeacherLevel[] = ['beginner', 'hsk1', 'hsk2', 'hsk3'];
const GOALS: TeacherGoal[] = ['daily_words', 'hsk_test', 'pinyin', 'writing', 'review'];

/** V3.7 — the interactive AI Teacher. Deterministic (no AI API). */
export default function AiTeacherAgent() {
  const { isAuthenticated } = useAuth();
  const { mode: pinyinModeVal, setMode: setPinyinMode, isVisible: pinyinIsVisible } = usePinyinMode();
  const [level, setLevel] = useState<TeacherLevel>('beginner');
  const [goal, setGoal] = useState<TeacherGoal>('daily_words');
  const [plan, setPlan] = useState<TeacherPlan | null>(null);

  const hskBand = (level === 'hsk2' ? 2 : level === 'hsk3' ? 3 : 1) as 1 | 2 | 3;
  const showPinyin = pinyinIsVisible(hskBand);

  const generate = () => {
    const p = generateTeacherPlan({ level, goal });
    setPlan(p);
    trackEvent('ai_teacher_plan_generated', { level, goal });
    // save a lightweight "daily plan" activity for logged-in users (fail-silent)
    if (isAuthenticated) {
      void markCompleted('quiz', 'ai-teacher-daily-plan');
    }
  };

  const onQuizComplete = (score: number) => {
    trackEvent('ai_teacher_quiz_completed', { level, goal, score });
    if (isAuthenticated) {
      void markCompleted('quiz', 'ai-teacher-mini-quiz', score);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* level selector */}
      <div>
        <h2 className="font-display font-bold text-white text-sm mb-2 flex items-center gap-1.5 font-arabic">
          <GraduationCap size={16} className="text-[#FF3333]" /> اختر مستواك
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              aria-pressed={level === l}
              className={`py-3 rounded-xl text-sm font-display font-bold font-arabic border transition-colors ${level === l ? 'bg-[#FF3333] text-white border-[#FF3333]' : 'bg-white/[0.03] text-white border-white/10 hover:bg-white/[0.06]'}`}
            >
              {LEVEL_LABEL[l]}
            </button>
          ))}
        </div>
      </div>

      {/* goal selector */}
      <div>
        <h2 className="font-display font-bold text-white text-sm mb-2 flex items-center gap-1.5 font-arabic">
          <Target size={16} className="text-[#FF3333]" /> اختر هدفك
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GOALS.map(g => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              aria-pressed={goal === g}
              className={`py-2.5 px-2 rounded-xl text-xs font-display font-bold font-arabic border transition-colors ${goal === g ? 'bg-[#FF3333] text-white border-[#FF3333]' : 'bg-white/[0.03] text-white border-white/10 hover:bg-white/[0.06]'}`}
            >
              {GOAL_LABEL[g]}
            </button>
          ))}
        </div>
      </div>

      {/* pinyin toggle + generate */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PinyinToggle mode={pinyinModeVal} onChange={setPinyinMode} hskLevel={hskBand} compact />
        <button onClick={generate} className="btn-primary text-sm py-3 px-8 font-arabic inline-flex items-center gap-2">
          <Sparkles size={16} /> ابدأ خطة اليوم
        </button>
      </div>

      {/* login reminder */}
      {!isAuthenticated && (
        <Link to="/login" className="liquid-glass rounded-xl p-3 flex items-center gap-2 hover:border-[#FF3333]/30 border border-transparent transition-colors">
          <LogIn size={15} className="text-[#FF3333] shrink-0" />
          <span className="text-xs font-arabic text-white">سجّل الدخول لحفظ تقدّمك ونتائجك</span>
        </Link>
      )}

      {/* generated plan + quiz */}
      {plan && (
        <div className="space-y-6 pt-2">
          <AiTeacherPlanCard plan={plan} showPinyin={showPinyin} />

          <div className="liquid-glass rounded-2xl p-5">
            <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-1.5 font-arabic">
              <Sparkles size={15} className="text-[#FF3333]" /> اختبار سريع
            </h3>
            <AiTeacherMiniQuiz quiz={plan.quiz} onComplete={onQuizComplete} />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-2">
            <Link to={`/hsk${hskBand}-simulation`} className="btn-primary text-xs py-2.5 px-4 font-arabic">ابدأ اختبار HSK</Link>
            <Link to="/dictionary" className="btn-secondary text-xs py-2.5 px-4 font-arabic">افتح القاموس</Link>
            <Link to="/writing-practice" className="btn-secondary text-xs py-2.5 px-4 font-arabic">تدرّب على الكتابة</Link>
          </div>
        </div>
      )}
    </div>
  );
}
