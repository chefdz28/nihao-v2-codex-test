import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Award, Zap } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { DailyMissions } from '@/components/TodaysPlan';
import { getXP, getBadges, getStats } from '@/lib/gamification';
import { fetchUserProgress, fetchQuizResults } from '@/lib/dataService';
import { completedLessonIds, computeStreak } from '@/lib/learning';
import type { UserProgressItem, QuizResult } from '@/types/supabase';

/** V2.1 /missions — daily missions hub */
export function Missions() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const stats = getStats();
  const isBeginner = (stats.lessons_done || 0) < 3;

  return (
    <div className="max-w-[700px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Target className="text-[#FF3333]" /> {t('missions.title')}
        </h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('missions.subtitle')}
        </p>
      </motion.div>
      <div className="liquid-glass p-4 mb-6 flex items-center justify-between">
        <span className="text-sm text-white flex items-center gap-2"><Zap size={16} className="text-[#f59e0b]" /> {t('missions.totalXp')}</span>
        <span className="font-display font-black text-2xl text-[#f59e0b]">{getXP()} XP</span>
      </div>
      <DailyMissions isBeginner={isBeginner} />
      <p className={`text-xs mt-4 text-center ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>
        {t('missions.resetNote')}
      </p>
    </div>
  );
}

/** V2.1 /achievements — badge collection with locked/unlocked states */
export function Achievements() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const isAr = lang === 'ar';
  const [extra, setExtra] = useState({ completedLessons: 0, streak: 0, xp: getXP() });

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [progress, quiz] = await Promise.all([
          fetchUserProgress(user.id) as Promise<UserProgressItem[]>,
          fetchQuizResults(user.id) as Promise<QuizResult[]>,
        ]);
        setExtra({
          completedLessons: completedLessonIds(progress).size,
          streak: computeStreak([
            ...progress.map(p => p.last_accessed_at),
            ...progress.map(p => p.updated_at),
            ...quiz.map(r => r.created_at),
          ]),
          xp: getXP(),
        });
      } catch { /* badges still work from local stats */ }
    }
    load();
  }, [user]);

  const badges = getBadges(extra);
  const unlocked = badges.filter(b => b.unlocked).length;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Award className="text-[#FF3333]" /> {t('badges.title')}
        </h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('badges.subtitle')} · {unlocked} / {badges.length}
        </p>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges.map(b => (
          <div key={b.id} className={`liquid-glass p-5 text-center rounded-2xl border transition-all ${b.unlocked ? 'border-[#f59e0b]/40' : 'border-white/5 opacity-50 grayscale'}`}>
            <span className="text-4xl block mb-2">{b.unlocked ? b.icon : '🔒'}</span>
            <p className={`text-sm font-display font-bold text-white mb-1 ${isAr ? 'font-arabic' : ''}`}>{t(b.labelKey)}</p>
            <p className={`text-[11px] leading-tight ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>{t(b.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Missions;
