import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { fetchQuizResults, fetchLessons } from '@/lib/dataService';
import { lowScoreLessons } from '@/lib/learning';
import type { LessonRow, QuizResult } from '@/types/supabase';

/**
 * V2 Review Mistakes: detailed per-question mistakes are not stored, so this
 * surfaces lessons whose best quiz score is below the pass threshold and
 * links back to the lesson quiz for another attempt.
 */
export default function Review() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const [r, l] = await Promise.all([fetchQuizResults(user.id), fetchLessons()]);
        setResults(r);
        setLessons(l);
      } catch (err) {
        console.error('Review load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  const weak = lowScoreLessons(results, 70);
  const lessonById = new Map(lessons.map(l => [l.id, l]));

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <RotateCcw className="text-[#FF3333]" /> {t('review.title')}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>{t('review.subtitle')}</p>
      </motion.div>

      {results.length === 0 ? (
        <div className="liquid-glass p-10 text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{t('review.noResults')}</p>
          <Link to="/courses" className="btn-primary text-sm">{t('review.startLearning')}</Link>
        </div>
      ) : weak.length === 0 ? (
        <div className="liquid-glass p-10 text-center">
          <CheckCircle2 size={40} className="text-[#10b981] mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-white mb-2">{t('review.allGood')}</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{t('review.allGoodSub')}</p>
          <Link to="/daily" className="btn-primary text-sm">{t('review.dailyPath')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {weak.map(w => {
            const lesson = lessonById.get(w.lessonId);
            if (!lesson) return null;
            return (
              <div key={w.lessonId} className="liquid-glass p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF3333]/15 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-[#FF3333]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-white">
                    {lesson.order_num}. {lang === 'ar' ? lesson.title_ar : lesson.title_en}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t('review.bestScore')}: <span className="text-[#FF3333] font-bold">{w.bestPercent}%</span>
                    {' · '}{t('review.attempts')}: {w.attempts}
                  </p>
                </div>
                <Link to={`/courses/${lesson.level_id}/${lesson.id}`} className="btn-primary text-sm py-2 px-4 shrink-0 text-center">
                  {t('review.practiceAgain')}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
