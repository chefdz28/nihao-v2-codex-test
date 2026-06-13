import { useState, useEffect } from 'react';
import JsonLd from '@/components/JsonLd';
import { learningResourceLd } from '@/lib/structuredData';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, Play, Search } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLevels, fetchLessons, fetchUserProgress, fetchQuizResults } from '@/lib/dataService';
import { firstIncompleteLesson, levelProgressPercent, completedLessonIds, lowScoreLessons } from '@/lib/learning';
import type { LevelRow, LessonRow, UserProgressItem, QuizResult } from '@/types/supabase';
import StartHere from '@/components/StartHere';
import PinyinText from '@/components/PinyinText';
import { STAGES, lessonsInStage } from '@/data/levels';
import { hsk1FullLessons } from '@/data/hsk1-full';
import { stripTones } from '@/lib/pinyin';

// Chinese titles + pinyin for the first 15 lessons (display enrichment only)
const LESSON_ZH: Record<number, { zh: string; py: string }> = {
  1: { zh: '你好', py: 'nǐ hǎo' }, 2: { zh: '谢谢', py: 'xièxie' },
  3: { zh: '你叫什么名字？', py: 'nǐ jiào shénme míngzi?' }, 4: { zh: '老师', py: 'lǎoshī' },
  5: { zh: '你几岁？', py: 'nǐ jǐ suì?' }, 6: { zh: '我会说汉语', py: 'wǒ huì shuō hànyǔ' },
  7: { zh: '今天几号？', py: 'jīntiān jǐ hào?' }, 8: { zh: '我想喝茶', py: 'wǒ xiǎng hē chá' },
  9: { zh: '你在哪儿工作？', py: 'nǐ zài nǎr gōngzuò?' }, 10: { zh: '请坐', py: 'qǐng zuò' },
  11: { zh: '现在几点？', py: 'xiànzài jǐ diǎn?' }, 12: { zh: '天气怎么样？', py: 'tiānqì zěnmeyàng?' },
  13: { zh: '我喜欢中国菜', py: 'wǒ xǐhuan zhōngguó cài' }, 14: { zh: '多少钱？', py: 'duōshao qián?' },
  15: { zh: '我坐飞机去中国', py: 'wǒ zuò fēijī qù zhōngguó' },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }),
};

export default function Courses() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<UserProgressItem[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'done' | 'upcoming' | 'review'>('all');

  useEffect(() => {
    async function load() {
      try {
        const [lData, lsData] = await Promise.all([fetchLevels(), fetchLessons()]);
        setLevels(lData);
        setLessons(lsData);
        if (user) {
          try {
            const p = await fetchUserProgress(user.id);
            setProgress(p);
            try { setQuizResults(await fetchQuizResults(user.id)); } catch { setQuizResults([]); }
          } catch {
            setProgress([]); // never block courses on progress errors
          }
        }
      } catch (err) {
        console.error('Courses load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading courses...</div>
      </div>
    );
  }

  // V2.1 derived data for stages + lesson grid
  const allLessons = [...lessons].sort((a, b) => a.order_num - b.order_num);
  const doneSet = completedLessonIds(progress);
  const reviewSet = new Set(lowScoreLessons(quizResults).map(x => x.lessonId));
  const lesson1 = allLessons.find(l => l.order_num === 1);
  const lesson1Path = lesson1 ? `/courses/${lesson1.level_id}/${lesson1.id}` : '/courses';
  const qNorm = stripTones(query.trim().toLowerCase());
  const visibleLessons = allLessons.filter(l => {
    if (filter === 'done' && !doneSet.has(l.id)) return false;
    if (filter === 'upcoming' && doneSet.has(l.id)) return false;
    if (filter === 'review' && !reviewSet.has(l.id)) return false;
    if (!qNorm) return true;
    const zh = LESSON_ZH[l.order_num];
    return (
      l.title_en.toLowerCase().includes(query.trim().toLowerCase()) ||
      l.title_ar.includes(query.trim()) ||
      (zh ? zh.zh.includes(query.trim()) || stripTones(zh.py).includes(qNorm) : false)
    );
  });

  return (
    <div>
      <JsonLd id="lr" data={learningResourceLd({ name: 'دورة الصينية للمبتدئين (HSK1)', description: 'دورة مجانية لتعلم الصينية من الصفر عبر 45 درساً متدرجاً مع البينين والصوت.', path: '/courses' })} />
      {/* Hero */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
            <Link to="/" className="hover:text-white transition-colors">{t('courses.breadcrumb.home')}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t('courses.breadcrumb.courses')}</span>
          </div>
          <motion.h1 className="font-display font-black text-white mb-4" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9 }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {t('courses.title')}
          </motion.h1>
          <motion.p className="text-lg max-w-[600px]" style={{ color: 'var(--color-text-secondary)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            {t('courses.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Level Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
            {levels.map((level, i) => {
              const levelLessons = lessons.filter(l => l.level_id === level.id);
              const hasLessons = levelLessons.length > 0;
              const startLesson = user
                ? firstIncompleteLesson(levelLessons, progress)
                : (levelLessons[0] || null);
              const pct = user ? levelProgressPercent(levelLessons, progress) : 0;

              return (
                <motion.div key={level.id} className="liquid-glass overflow-hidden group" variants={fadeInUp} custom={i} whileHover={{ y: -4 }}>
                  <div className="relative h-[200px] overflow-hidden">
                    <img src={level.image_url || '/images/lesson-chinese-basics.jpg'} alt={level.title_en} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-[#FF3333] flex items-center justify-center font-display font-black text-white text-lg">{level.order_num}</div>
                    {level.is_premium && (
                      <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-[#0a0a0a]/80 flex items-center gap-1">
                        <Lock size={12} className="text-[#a0a0a0]" />
                        <span className="text-[10px] text-[#a0a0a0] font-display font-bold uppercase">Premium</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-white mb-1">{lang === 'ar' ? level.title_ar : level.title_en}</h3>
                    <p className="text-xs mb-2 font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? level.title_en : level.title_ar}</p>
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? (level.description_ar || level.description_en) : level.description_en}</p>
                    {user && hasLessons && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span style={{ color: 'var(--color-text-tertiary)' }}>{t('courses.progress')}</span>
                          <span className="text-white font-bold">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#FF3333] to-[#ff7755] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {levelLessons.length} {t('level.lessons')} · ~{level.estimated_hours}h
                      </span>
                      {hasLessons && startLesson ? (
                        <Link to={`/courses/${level.id}/${startLesson.id}`} className="btn-primary text-xs py-2 px-4" onClick={e => e.stopPropagation()}>
                          <Play size={12} /> {user && pct > 0 ? t('courses.continue') : t('level.startLearning')}
                        </Link>
                      ) : (
                        <span className="text-xs px-3 py-2 rounded-lg bg-white/5 text-[#666] font-display font-bold uppercase">{t('level.locked')}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* V2.1: Start Here — pinyin-first beginner flow */}
      <section className="pb-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          <StartHere lesson1Path={lesson1Path} />
        </div>
      </section>

      {/* V2.1: learning stages strip */}
      <section className="pb-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display font-bold text-2xl text-white mb-5">{t('stages.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STAGES.map(stage => {
              const stageLessons = lessonsInStage(stage, allLessons);
              const doneCount = stageLessons.filter(l => doneSet.has(l.id)).length;
              const pctStage = stageLessons.length ? Math.round((doneCount / stageLessons.length) * 100) : 0;
              const next = stageLessons.find(l => !doneSet.has(l.id));
              return (
                <div key={stage.id} className="liquid-glass p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{stage.emoji}</span>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-white">{lang === 'ar' ? stage.title_ar : stage.title_en}</h3>
                      <p className={`text-[11px] ${lang === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>
                        {lang === 'ar' ? stage.desc_ar : stage.desc_en}
                      </p>
                    </div>
                  </div>
                  {stage.range ? (
                    <>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: 'var(--color-text-tertiary)' }}>{doneCount} / {stageLessons.length} {t('level.lessons')}</span>
                        <span className="text-white font-bold">{pctStage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                        <div className="h-full bg-[#FF3333] rounded-full" style={{ width: `${pctStage}%` }} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {next ? (
                          <Link to={`/courses/${next.level_id}/${next.id}`} className="btn-primary text-[11px] py-1.5 px-3">
                            {t('stages.next')}: {next.order_num}
                          </Link>
                        ) : <span className="text-[11px] text-[#10b981]">✓ {t('stages.completeAll')}</span>}
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-white/5" style={{ color: 'var(--color-text-tertiary)' }}>{t('stages.finalTest')} · {t('stages.soon')}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {stage.tools?.map(tool => (
                        <Link key={tool.path} to={tool.path} className="btn-secondary text-[11px] py-1.5 px-3">{t(tool.labelKey)}</Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* V2.1: all lessons grid with search + filters */}
      <section className="pb-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display font-bold text-2xl text-white mb-5">{t('courses.allLessons')} ({allLessons.length})</h2>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-4 text-[#666]" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('courses.searchLessons')}
                className="w-full bg-[#161616] border border-white/10 rounded-xl ps-11 pe-4 py-3 text-white text-sm focus:border-[#FF3333]/50 outline-none"
              />
            </div>
            <div className="flex gap-2">
              {([['all', t('courses.filter.all')], ['done', t('courses.filter.done')], ['upcoming', t('courses.filter.upcoming')], ['review', t('courses.filter.review')]] as const).map(([f, label]) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-display font-semibold transition-all ${filter === f ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {allLessons.length === 0 ? (
            // Supabase unavailable → fallback display of built-in HSK1 lessons
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hsk1FullLessons.map(l => (
                <div key={l.id} className="liquid-glass p-5 rounded-2xl opacity-90">
                  <span className="text-xs font-display font-bold text-[#FF3333]">{t('courses.lesson')} {l.order}</span>
                  <h3 className="font-display font-bold text-white mt-1">{l.titleEn}</h3>
                  <p className="text-sm font-arabic" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{l.titleAr}</p>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('courses.offlineNote')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleLessons.map(lesson => {
                const zh = LESSON_ZH[lesson.order_num];
                const isDone = doneSet.has(lesson.id);
                const isReview = reviewSet.has(lesson.id);
                const btn = isDone ? t('courses.review') : progress.some(p => p.lesson_id === lesson.id) ? t('courses.continue') : t('courses.startLesson');
                return (
                  <Link key={lesson.id} to={`/courses/${lesson.level_id}/${lesson.id}`}
                    className={`liquid-glass p-5 rounded-2xl border transition-colors hover:border-[#FF3333]/30 ${isDone ? 'border-[#10b981]/25' : 'border-transparent'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-display font-bold text-[#FF3333]">{t('courses.lesson')} {lesson.order_num}</span>
                      {isDone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981]">✓ {t('courses.filter.done')}</span>}
                      {isReview && !isDone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b]">{t('courses.review')}</span>}
                    </div>
                    {zh && <p className="font-chinese text-2xl text-white mb-0.5">{zh.zh}</p>}
                    {zh && <PinyinText>{zh.py}</PinyinText>}
                    <h3 className="font-display font-bold text-white mt-1">{lang === 'ar' ? lesson.title_ar : lesson.title_en}</h3>
                    <p className={`text-xs ${lang === 'ar' ? '' : 'font-arabic'}`} dir={lang === 'ar' ? 'ltr' : 'rtl'} style={{ color: 'var(--color-text-secondary)' }}>
                      {lang === 'ar' ? lesson.title_en : lesson.title_ar}
                    </p>
                    <span className="btn-secondary text-[11px] py-1.5 px-3 inline-flex mt-3"><Play size={11} /> {btn}</span>
                  </Link>
                );
              })}
              {visibleLessons.length === 0 && (
                <p className={`col-span-full text-center py-10 text-sm ${lang === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>{t('dict.empty')}</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
