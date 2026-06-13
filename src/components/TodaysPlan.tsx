import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Check, Zap, Target } from 'lucide-react';
import { useI18n } from '@/i18n';
import { getPlanDone, markPlanDone, getMissions, claimMission, XP_REWARDS } from '@/lib/gamification';

interface PlanTask { id: string; emoji: string; labelKey: string; descKey: string; link: string; xp: number }

const BEGINNER_PLAN: PlanTask[] = [
  { id: 'b_pinyin', emoji: '🔤', labelKey: 'plan.learnPinyin', descKey: 'plan.learnPinyin.d', link: '/pinyin', xp: XP_REWARDS.plan_task },
  { id: 'b_tones', emoji: '🎵', labelKey: 'plan.practiceTones', descKey: 'plan.practiceTones.d', link: '/tones', xp: XP_REWARDS.plan_task },
  { id: 'b_numbers', emoji: '🔢', labelKey: 'plan.learnNumbers', descKey: 'plan.learnNumbers.d', link: '/essentials', xp: XP_REWARDS.plan_task },
  { id: 'b_lesson1', emoji: '🎓', labelKey: 'plan.startLesson1', descKey: 'plan.startLesson1.d', link: '/courses', xp: XP_REWARDS.plan_task },
];

const PROGRESS_PLAN: PlanTask[] = [
  { id: 'p_continue', emoji: '🎓', labelKey: 'plan.continueLesson', descKey: 'plan.continueLesson.d', link: '/path', xp: XP_REWARDS.plan_task },
  { id: 'p_tones', emoji: '🎵', labelKey: 'plan.practiceTones', descKey: 'plan.tones3.d', link: '/tones', xp: XP_REWARDS.plan_task },
  { id: 'p_cards', emoji: '🃏', labelKey: 'plan.reviewCards', descKey: 'plan.reviewCards.d', link: '/flashcards', xp: XP_REWARDS.plan_task },
  { id: 'p_grammar', emoji: '📐', labelKey: 'plan.grammarOne', descKey: 'plan.grammarOne.d', link: '/courses', xp: XP_REWARDS.plan_task },
  { id: 'p_dialogue', emoji: '💬', labelKey: 'plan.dialogueOne', descKey: 'plan.dialogueOne.d', link: '/dialogues', xp: XP_REWARDS.plan_task },
];

/** V2.1 Today's Plan — 4–5 daily tasks, localStorage state, XP on completion. */
export function TodaysPlan({ hasProgress, lesson1Path }: { hasProgress: boolean; lesson1Path?: string }) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [done, setDone] = useState<string[]>(getPlanDone());

  const tasks = (hasProgress ? PROGRESS_PLAN : BEGINNER_PLAN).map(task =>
    task.id === 'b_lesson1' && lesson1Path ? { ...task, link: lesson1Path } : task,
  );

  const complete = (id: string) => {
    markPlanDone(id);
    setDone(getPlanDone());
  };

  return (
    <div className="liquid-glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
          <CalendarCheck size={20} className="text-[#FF3333]" /> {t('plan.title')}
        </h2>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {done.length} / {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map(task => {
          const isDone = done.includes(task.id);
          return (
            <div key={task.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${isDone ? 'border-[#10b981]/30 bg-[#10b981]/5' : 'border-white/10 bg-white/[0.02]'}`}>
              <span className="text-2xl shrink-0">{task.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isDone ? 'text-[#10b981] line-through' : 'text-white'} ${isAr ? 'font-arabic' : ''}`}>{t(task.labelKey)}</p>
                <p className={`text-[11px] ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>{t(task.descKey)}</p>
              </div>
              <span className="text-[11px] text-[#f59e0b] shrink-0 flex items-center gap-0.5"><Zap size={11} /> +{task.xp}</span>
              {isDone ? (
                <span className="w-9 h-9 rounded-full bg-[#10b981]/15 flex items-center justify-center shrink-0"><Check size={16} className="text-[#10b981]" /></span>
              ) : (
                <div className="flex gap-1.5 shrink-0">
                  <Link to={task.link} className="btn-secondary text-[11px] py-1.5 px-3">{t('plan.go')}</Link>
                  <button onClick={() => complete(task.id)} className="btn-primary text-[11px] py-1.5 px-3">{t('plan.done')}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** V2.1 Daily Missions — auto-tracked from activity stats, claim for XP, daily reset. */
export function DailyMissions({ isBeginner }: { isBeginner: boolean }) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [tick, setTick] = useState(0);
  const missions = getMissions(isBeginner);
  void tick;

  const claim = (id: string) => {
    claimMission(id);
    setTick(x => x + 1);
  };

  return (
    <div className="liquid-glass p-6">
      <h2 className="font-display font-bold text-xl text-white flex items-center gap-2 mb-4">
        <Target size={20} className="text-[#FF3333]" /> {t('missions.title')}
      </h2>
      <div className="space-y-2">
        {missions.map(m => (
          <div key={m.id} className={`rounded-xl border p-3 ${m.claimed ? 'border-[#10b981]/30 bg-[#10b981]/5' : 'border-white/10 bg-white/[0.02]'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${m.claimed ? 'text-[#10b981]' : 'text-white'} ${isAr ? 'font-arabic' : ''}`}>{t(m.labelKey)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#FF3333] rounded-full transition-all" style={{ width: `${(m.current / m.target) * 100}%` }} />
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>{m.current}/{m.target}</span>
                </div>
              </div>
              <span className="text-[11px] text-[#f59e0b] shrink-0 flex items-center gap-0.5"><Zap size={11} /> +{m.xp}</span>
              {m.claimed ? (
                <Check size={16} className="text-[#10b981] shrink-0" />
              ) : m.complete ? (
                <button onClick={() => claim(m.id)} className="btn-primary text-[11px] py-1.5 px-3 shrink-0">{t('missions.claim')}</button>
              ) : (
                <Link to={m.link} className="btn-secondary text-[11px] py-1.5 px-3 shrink-0">{t('plan.go')}</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
