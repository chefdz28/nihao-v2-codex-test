import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Printer, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLessons, fetchUserProgress, fetchQuizResults } from '@/lib/dataService';
import { completedLessonIds, computeStreak, lowScoreLessons, averageQuizScore } from '@/lib/learning';
import { getXP, getBadges, getPlacement } from '@/lib/gamification';
import { mistakeSummary } from '@/lib/mistakes';
import { loadHskResults } from '@/lib/hskResults';
import { STAGES, lessonsInStage } from '@/data/levels';
import type { LessonRow, UserProgressItem, QuizResult } from '@/types/supabase';

/** V2.2.1 /report — printable student progress report (for student/parent/teacher) */
export default function Report() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const isAr = lang === 'ar';
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<UserProgressItem[]>([]);
  const [quiz, setQuiz] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLessons(await fetchLessons());
        if (user) {
          try {
            setProgress(await fetchUserProgress(user.id));
            setQuiz(await fetchQuizResults(user.id));
          } catch { /* report still renders from local data */ }
        }
      } finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div></div>;
  }

  const done = completedLessonIds(progress);
  const streak = computeStreak([...progress.map(p => p.last_accessed_at), ...progress.map(p => p.updated_at), ...quiz.map(r => r.created_at)]);
  const xp = getXP();
  const badges = getBadges({ completedLessons: done.size, streak, xp });
  const unlockedBadges = badges.filter(b => b.unlocked);
  const placement = getPlacement();
  const hsk = loadHskResults();
  const lastHsk = hsk[hsk.length - 1];
  const mistakes = mistakeSummary();
  const weak = lowScoreLessons(quiz).slice(0, 5);
  const avg = averageQuizScore(quiz);
  let certs: Record<string, { score: number; total: number; date: string }> = {};
  try { certs = JSON.parse(window.localStorage.getItem('nihao_certs_v1') || '{}'); } catch { /* none */ }

  const nextSteps: string[] = [];
  if (done.size === 0) nextSteps.push(t('report.stepPinyin'));
  if (mistakes.total - mistakes.mastered > 5) nextSteps.push(t('report.stepMistakes'));
  if (weak.length > 0) nextSteps.push(t('report.stepWeak'));
  if (!lastHsk && done.size >= 8) nextSteps.push(t('report.stepHsk'));
  if (nextSteps.length === 0) nextSteps.push(t('report.stepContinue'));

  return (
    <div className="max-w-[820px] mx-auto px-6 py-8 print:p-0 print:max-w-none">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-3xl text-white flex items-center gap-3">
          <FileBarChart className="text-[#FF3333]" /> {t('report.title')}
        </motion.h1>
        <div className="flex items-center gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder={t('certs.namePlaceholder')}
            className="bg-[#161616] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-[#FF3333]/50 outline-none" />
          <button onClick={() => window.print()} className="btn-primary text-sm py-2 px-5"><Printer size={15} /> {t('report.print')}</button>
        </div>
      </div>

      <div className="bg-white text-black rounded-2xl p-8 print:rounded-none rpt-sheet" dir={isAr ? 'rtl' : 'ltr'}>
        <style>{`@media print { body * { visibility: hidden; } .rpt-sheet, .rpt-sheet * { visibility: visible; } .rpt-sheet { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <div>
            <h1 className="font-bold text-xl">NiHao · {t('report.heading')}</h1>
            <p className="text-sm text-gray-700">{name || '________________'} · {new Date().toISOString().slice(0, 10)}</p>
          </div>
          <p className="text-xs text-gray-600">cnihao.com</p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-4 gap-3 mb-6 text-center">
          {[
            [t('dashboard.completed'), `${done.size}/${lessons.length || 45}`],
            ['XP', String(xp)],
            [t('dashboard.streak'), `${streak} 🔥`],
            [t('dashboard.avgScore'), `${avg}%`],
          ].map(([label, val]) => (
            <div key={label} className="border border-gray-300 rounded-lg p-3">
              <p className="text-xl font-bold">{val}</p>
              <p className="text-[10px] text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        {/* Stage progress */}
        <h2 className="font-bold text-base mb-2">{t('stages.title')}</h2>
        <div className="space-y-1.5 mb-6">
          {STAGES.filter(s => s.range).map(s => {
            const sl = lessonsInStage(s, lessons);
            const d = sl.filter(l => done.has(l.id)).length;
            const pct = sl.length ? Math.round((d / sl.length) * 100) : 0;
            return (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0">{s.emoji} {isAr ? s.title_ar : s.title_en}</span>
                <span className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden"><span className="block h-full bg-red-600 rounded-full" style={{ width: `${pct}%` }} /></span>
                <span className="w-16 text-xs text-gray-700">{d}/{sl.length} · {pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Badges + certificates */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="font-bold text-base mb-2">{t('badges.title')} ({unlockedBadges.length}/{badges.length})</h2>
            <p className="text-sm leading-relaxed">{unlockedBadges.length > 0 ? unlockedBadges.map(b => `${b.icon} ${t(b.labelKey)}`).join('، ') : '—'}</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">{t('certs.title')}</h2>
            {Object.keys(certs).length === 0 ? <p className="text-sm">—</p> : (
              <ul className="text-sm space-y-1">
                {Object.entries(certs).map(([sid, c]) => {
                  const st = STAGES.find(x => x.id === sid);
                  return <li key={sid}>🎓 {st ? (isAr ? st.title_ar : st.title_en) : sid} — {Math.round((c.score / c.total) * 100)}% ({c.date})</li>;
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Tests */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="font-bold text-base mb-2">{t('placement.title')}</h2>
            <p className="text-sm">{placement ? `${placement.score}/${placement.total} · ${placement.date}` : t('report.notTaken')}</p>
          </div>
          <div>
            <h2 className="font-bold text-base mb-2">{t('hsk.title')}</h2>
            <p className="text-sm">{lastHsk ? `${lastHsk.score}/${lastHsk.total} (${Math.round((lastHsk.score / lastHsk.total) * 100)}%) · ${lastHsk.date} ${lastHsk.passed ? '✓' : '✗'}` : t('report.notTaken')}</p>
          </div>
        </div>

        {/* Mistakes + weak areas */}
        <h2 className="font-bold text-base mb-2">{t('mist.title')}</h2>
        <p className="text-sm mb-4">{t('report.mistakesLine')}: {mistakes.total} · {t('report.mastered')}: {mistakes.mastered} · {t('report.open')}: {mistakes.total - mistakes.mastered}</p>
        {weak.length > 0 && (
          <>
            <h2 className="font-bold text-base mb-2">{t('dashboard.areasToPractice')}</h2>
            <ul className="text-sm mb-4 space-y-0.5">
              {weak.map(w => {
                const l = lessons.find(x => x.id === w.lessonId);
                return <li key={w.lessonId}>• {l ? `${l.order_num}. ${isAr ? l.title_ar : l.title_en}` : w.lessonId} — {w.bestPercent}%</li>;
              })}
            </ul>
          </>
        )}

        {/* Next steps */}
        <h2 className="font-bold text-base mb-2">{t('report.nextSteps')}</h2>
        <ol className="text-sm space-y-1 mb-6">
          {nextSteps.map((s, i) => <li key={i}>{i + 1}. {s}</li>)}
        </ol>

        <p className="text-[10px] text-gray-500 text-center">© NiHao — cnihao.com · {t('certs.footer')}</p>
      </div>
    </div>
  );
}
