import { useState, useRef, useEffect } from 'react';
import { recordMistake } from '@/lib/mistakes';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpenText, Volume2, Check, X, ArrowLeft, ArrowRight, Eye, EyeOff, Play, Pause } from 'lucide-react';
import VoicePractice from '@/components/VoicePractice';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import { stories } from '@/data/stories2';
import { wordBySlug, wordSlug } from '@/data/dictionaryCore';
import { awardXP, trackActivity } from '@/lib/gamification';
import { STAGES } from '@/data/levels';

/** V2.2 /stories — beginner graded-reading library */
export function Stories() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <BookOpenText className="text-[#FF3333]" /> {t('stories.title')}
        </h1>
        <p className={`text-sm mb-8 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('stories.subtitle')}
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stories.map(s => {
          const stage = STAGES.find(st => st.range && st.range[0] <= (s.stage === 1 ? 1 : 10));
          return (
            <Link key={s.id} to={`/stories/${s.id}`} className="liquid-glass p-5 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{s.emoji}</span>
                <div className="min-w-0">
                  <p className="font-chinese text-xl text-white">{s.title_zh}</p>
                  <PinyinText>{s.title_py}</PinyinText>
                </div>
              </div>
              <p className="text-sm font-arabic text-white" dir="rtl">{s.title_ar}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s.title_en}</p>
              <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                <span className="px-2 py-0.5 rounded-full bg-white/5">{stage?.emoji} {t('stories.stage')} {s.stage}</span>
                <span>{s.sentences.length} {t('stories.sentences')}</span>
                <span>· ~{Math.max(1, Math.round(s.sentences.length * 0.4))} {t('stories.readTime')}</span>
                <span>· {s.quiz.length} {t('stories.questions')}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** V2.2 /stories/:storyId — bilingual reader with audio, pinyin toggle and quiz */
export function StoryReader() {
  const { storyId } = useParams<{ storyId: string }>();
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const story = stories.find(s => s.id === storyId);

  // V2.3: SEO title for the story detail page (guarded; runs in consistent order)
  useEffect(() => {
    if (story) document.title = `${story.title_zh} (${story.title_ar}) | NiHao`;
    return () => { document.title = 'NiHao'; };
  }, [story]);

  const [showPinyin, setShowPinyin] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  // V2.2.1: full-story listening mode (podcast style, browser TTS only)
  const [playingAll, setPlayingAll] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(-1);
  const playingRef = useRef(false);
  // V2.2.1 + V2.7A.3: shadowing — record yourself, replay for self-comparison
  // Story audio (speechSynthesis) is untouched; the user's mic recording is now
  // handled by the shared <VoicePractice/> component (local-only).

  useEffect(() => () => {
    playingRef.current = false;
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
  }, []);

  const speakSentence = (text: string) => new Promise<void>(resolve => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.85;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    } catch { resolve(); }
  });

  const playAll = async () => {
    if (!story) return;
    if (playingAll) { // pause
      playingRef.current = false;
      setPlayingAll(false);
      try { window.speechSynthesis.cancel(); } catch { /* noop */ }
      return;
    }
    playingRef.current = true;
    setPlayingAll(true);
    const startAt = currentSentence >= 0 && currentSentence < story.sentences.length - 1 ? currentSentence : 0;
    for (let si = startAt; si < story.sentences.length; si++) {
      if (!playingRef.current) break;
      setCurrentSentence(si);
      await speakSentence(story.sentences[si].zh);
      await new Promise(r => setTimeout(r, 450));
    }
    playingRef.current = false;
    setPlayingAll(false);
  };

  if (!story) {
    return (
      <div className="text-center py-20">
        <p className="text-white mb-4">{t('stories.notFound')}</p>
        <Link to="/stories" className="btn-primary text-sm">{t('stories.all')}</Link>
      </div>
    );
  }

  const q = story.quiz[qIndex];

  const pick = (opt: string) => {
    if (picked !== null) return;
    setPicked(opt);
    if (opt === q.correct) setScore(s => s + 1);
    else recordMistake({
      source: 'story',
      question: isAr ? q.q_ar : q.q_en,
      chinese: q.chinese || q.correct,
      pinyin: q.pinyin,
      yourAnswer: opt,
      correctAnswer: q.correct,
      explain_ar: `من قصة: ${story.title_ar}`,
      explain_en: `From story: ${story.title_en}`,
      link: `/stories/${story.id}`,
    });
  };

  const next = () => {
    if (qIndex < story.quiz.length - 1) {
      setQIndex(i => i + 1);
      setPicked(null);
    } else {
      // XP once per story (anti-dupe), track reading activity
      awardXP(`story:${story.id}`, 15);
      trackActivity('words_seen', story.vocab.length);
      setFinished(true);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/stories" className="btn-secondary text-xs py-2 px-4"><ArrowLeft size={13} /> {t('stories.all')}</Link>
        <button onClick={() => setShowPinyin(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-semibold transition-all ${showPinyin ? 'bg-[#FF3333]/15 text-[#FF3333] border border-[#FF3333]/30' : 'liquid-glass text-[#a0a0a0] border border-white/10'}`}>
          {showPinyin ? <Eye size={13} /> : <EyeOff size={13} />} {showPinyin ? t('pinyin.hide') : t('pinyin.show')}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <span className="text-5xl block mb-3">{story.emoji}</span>
        <h1 className="font-chinese text-3xl text-white mb-1">{story.title_zh}</h1>
        <PinyinText size="base" className="text-center">{story.title_py}</PinyinText>
        <p className="text-base font-arabic text-white mt-1" dir="rtl">{story.title_ar}</p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{story.title_en}</p>
      </motion.div>

      {!quizMode && (
        <>
          {/* Vocabulary used */}
          <div className="liquid-glass p-4 mb-6">
            <p className="text-xs font-display font-semibold uppercase mb-3" style={{ color: 'var(--color-text-tertiary)' }}>{t('stories.wordsUsed')}</p>
            <div className="flex flex-wrap gap-2">
              {story.vocab.map(v => {
                const slug = wordSlug(v.zh, v.py);
                const inDict = wordBySlug(slug);
                const inner = (
                  <>
                    <span className="font-chinese text-lg text-white block">{v.zh}</span>
                    {showPinyin && <PinyinText className="text-center">{v.py}</PinyinText>}
                    <span className="text-[10px] block" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? v.ar : v.en}</span>
                  </>
                );
                return inDict ? (
                  <Link key={v.zh} to={`/dictionary/${slug}`} onClick={() => trackActivity('words_seen')} className="rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#FF3333]/40 px-3 py-2 text-center transition-colors">
                    {inner}
                  </Link>
                ) : (
                  <button key={v.zh} onClick={() => play(v.zh)} className="rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#FF3333]/40 px-3 py-2 text-center transition-colors">
                    {inner}
                  </button>
                );
              })}
            </div>
          </div>

          {/* V2.2.1 + V2.7A.3 + V2.8C: listening mode (speechSynthesis) + unified voice practice */}
          <div className="liquid-glass p-4 mb-2 flex items-center justify-center">
            <button onClick={playAll} className="btn-primary text-sm py-2.5 px-5">
              {playingAll ? <><Pause size={14} /> {t('stories.pause')}</> : <><Play size={14} /> {t('stories.playAll')}</>}
            </button>
          </div>

          {/* shared local-only voice practice (record / play back / retry) */}
          <div className="mb-4">
            <VoicePractice />
          </div>

          {/* Story sentences */}
          <div className="space-y-3 mb-8">
            {story.sentences.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`liquid-glass p-4 flex items-start gap-3 transition-colors ${currentSentence === i && playingAll ? 'border border-[#FF3333]/50 bg-[#FF3333]/5' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-[#FF3333]/15 text-[#FF3333] text-xs flex items-center justify-center shrink-0 mt-1">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-chinese text-xl text-white leading-relaxed">{s.zh}</p>
                  {showPinyin && <PinyinText size="base">{s.py}</PinyinText>}
                  <p className="text-sm font-arabic mt-1" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{s.ar}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{s.en}</p>
                </div>
                <button onClick={() => play(s.zh)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF3333]/40 flex items-center justify-center shrink-0 transition-colors">
                  <Volume2 size={14} className="text-white" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Related lessons + quiz CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {story.relatedLessons.map(n => (
                <Link key={n} to="/courses" className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#c0c0c0] hover:text-white transition-colors">
                  {t('courses.lesson')} {n}
                </Link>
              ))}
            </div>
            <button onClick={() => setQuizMode(true)} className="btn-primary text-sm py-2.5 px-6">
              {t('stories.startQuiz')} <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}

      {/* Quiz */}
      {quizMode && !finished && (
        <div className="liquid-glass p-6">
          <div className="flex items-center justify-between text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            <span>{qIndex + 1} / {story.quiz.length}</span>
            <span>{t('listening.score')}: {score}</span>
          </div>
          <p className={`text-base text-white mb-3 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>{isAr ? q.q_ar : q.q_en}</p>
          {q.chinese && <p className="font-chinese text-2xl text-white text-center mb-4">{q.chinese}</p>}
          <div className="space-y-2">
            {q.options.map(opt => {
              let cls = 'w-full text-left p-3 rounded-xl border font-chinese text-base transition-all ';
              if (picked !== null) {
                if (opt === q.correct) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
                else if (opt === picked) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
                else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
              } else cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]';
              return <button key={opt} onClick={() => pick(opt)} disabled={picked !== null} className={cls}>{opt}</button>;
            })}
          </div>
          {picked !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mt-4">
              <span className="flex items-center gap-2 text-sm">
                {picked === q.correct
                  ? <><Check size={15} className="text-[#10b981]" /><span className="text-[#10b981]">{t('grammar.correct')}</span></>
                  : <><X size={15} className="text-[#FF3333]" /><span className="font-chinese text-white">{q.correct}</span></>}
                {q.pinyin && <PinyinText inline>{q.pinyin}</PinyinText>}
              </span>
              <button onClick={next} className="btn-primary text-sm py-2 px-4">
                {qIndex < story.quiz.length - 1 ? t('listening.next') : t('listening.finish')}
              </button>
            </motion.div>
          )}
        </div>
      )}

      {finished && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="liquid-glass p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-[#10b981]/15 flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-black text-xl text-[#10b981]">{score}/{story.quiz.length}</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">{t('stories.quizDone')}</h2>
          <p className="text-xs text-[#f59e0b] mb-6">+15 XP</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { setQuizMode(false); setFinished(false); setQIndex(0); setPicked(null); setScore(0); }} className="btn-secondary text-sm">{t('stories.readAgain')}</button>
            <Link to="/stories" className="btn-primary text-sm">{t('stories.more')}</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Stories;
