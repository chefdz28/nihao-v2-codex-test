import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Check, Loader2, Star } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLevels, fetchLessons, fetchUserProgress } from '@/lib/dataService';
import { STAGES } from '@/data/levels';
import { completedLessonIds, firstIncompleteLesson } from '@/lib/learning';
import type { LevelRow, LessonRow, UserProgressItem } from '@/types/supabase';

/**
 * V2.0.5 /path — visual learning path (Duolingo-style): the level's lessons
 * as connected circles. Completed = green check, current = pulsing red,
 * upcoming = gray. Nothing is locked — every lesson stays clickable.
 */
export default function PathMap() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<UserProgressItem[]>([]);
  const [levelId, setLevelId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [lv, ls] = await Promise.all([fetchLevels(), fetchLessons()]);
        setLevels(lv);
        setLessons(ls);
        if (lv.length > 0) setLevelId(lv[0].id);
        if (user) {
          try { setProgress(await fetchUserProgress(user.id)); } catch { setProgress([]); }
        }
      } catch (err) {
        console.error('Path load error:', err);
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

  const levelLessons = lessons.filter(l => l.level_id === levelId).sort((a, b) => a.order_num - b.order_num);
  const done = completedLessonIds(progress);
  const current = firstIncompleteLesson(levelLessons, progress);

  return (
    <div className="max-w-[640px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Map className="text-[#FF3333]" /> {t('path.title')}
        </h1>
        <p className={`text-sm mb-6 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('path.subtitle')}
        </p>
      </motion.div>

      {/* Level selector */}
      {levels.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {levels.map(lv => (
            <button key={lv.id} onClick={() => setLevelId(lv.id)}
              className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all ${levelId === lv.id ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'}`}>
              {lang === 'ar' ? lv.title_ar : lv.title_en}
            </button>
          ))}
        </div>
      )}

      {/* Progress summary */}
      <div className="liquid-glass p-4 mb-8 flex items-center justify-between">
        <span className="text-sm text-white">
          <Star size={14} className="inline text-[#f59e0b] mr-1" />
          {levelLessons.filter(l => done.has(l.id)).length} / {levelLessons.length} {t('path.completed')}
        </span>
        {current && (
          <Link to={`/courses/${current.level_id}/${current.id}`} className="btn-primary text-xs py-2 px-4">
            {t('path.continue')}
          </Link>
        )}
      </div>

      {/* V2.1: Level 0 + stage headers */}
      <div className="liquid-glass p-5 mb-8 rounded-2xl border border-[#FF3333]/20">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔤</span>
          <div>
            <h3 className="font-display font-bold text-white">{lang === 'ar' ? STAGES[0].title_ar : STAGES[0].title_en}</h3>
            <p className={`text-[11px] ${lang === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>{lang === 'ar' ? STAGES[0].desc_ar : STAGES[0].desc_en}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {STAGES[0].tools?.map(tool => (
            <Link key={tool.path} to={tool.path} className="btn-secondary text-[11px] py-1.5 px-3">{t(tool.labelKey)}</Link>
          ))}
        </div>
      </div>

      {/* The path */}
      <div className="relative">
        {/* vertical spine */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-white/5 rounded-full" />
        <div className="space-y-6 relative">
          {levelLessons.map((lesson, i) => {
            const isDone = done.has(lesson.id);
            const isCurrent = current?.id === lesson.id;
            const stageStart = STAGES.find(st => st.range && st.range[0] === lesson.order_num);
            const stageEnd = STAGES.find(st => st.range && st.range[1] === lesson.order_num);
            const side = i % 2 === 0 ? 'mr-auto pr-[54%] text-right' : 'ml-auto pl-[54%] text-left';
            return (
              <motion.div key={lesson.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
                {stageStart && (
                  <div className="relative z-10 flex justify-center mb-6">
                    <span className="liquid-glass px-4 py-2 rounded-full text-xs font-display font-bold text-white border border-[#FF3333]/30">
                      {stageStart.emoji} {lang === 'ar' ? stageStart.title_ar : stageStart.title_en}
                    </span>
                  </div>
                )}
                <div className="relative min-h-[64px]">
                {/* node on the spine */}
                <Link
                  to={`/courses/${lesson.level_id}/${lesson.id}`}
                  className={`absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center font-display font-bold transition-transform hover:scale-110 z-10 ${
                    isDone ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30'
                    : isCurrent ? 'bg-[#FF3333] text-white shadow-lg shadow-[#FF3333]/40 animate-pulse'
                    : 'bg-[#1e1e1e] border-2 border-white/15 text-[#888]'
                  }`}
                  aria-label={lesson.title_en}
                >
                  {isDone ? <Check size={22} /> : lesson.order_num}
                </Link>
                {/* label card */}
                <div className={`${side}`}>
                  <Link to={`/courses/${lesson.level_id}/${lesson.id}`} className="inline-block">
                    <p className={`text-sm font-semibold ${isCurrent ? 'text-[#FF3333]' : isDone ? 'text-white' : 'text-[#999]'}`}>
                      {lang === 'ar' ? lesson.title_ar : lesson.title_en}
                    </p>
                    {isCurrent && <p className="text-[11px] text-[#f59e0b]">{t('path.youAreHere')}</p>}
                  </Link>
                </div>
                </div>
                {stageEnd && (
                  <div className="relative z-10 flex justify-center mt-6">
                    <span className="px-4 py-2 rounded-full text-[11px] bg-white/5 border border-white/10" style={{ color: 'var(--color-text-tertiary)' }}>
                      🏆 {lang === 'ar' ? stageEnd.title_ar : stageEnd.title_en} — {t('stages.finalTest')} ({t('stages.soon')})
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
