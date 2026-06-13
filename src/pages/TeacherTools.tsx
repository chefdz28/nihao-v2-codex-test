import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Printer, Headphones, Volume2, Eye, EyeOff, ArrowRight, Turtle, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import { fetchLessons, fetchVocabulary, fetchSentences } from '@/lib/dataService';
import type { LessonRow, VocabRow, SentenceRow } from '@/types/supabase';

/** V2.2.1 /flashcards-print — printable flashcards: cut-out or front/back modes */
export function FlashcardsPrint() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [params] = useSearchParams();
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [lessonId, setLessonId] = useState(params.get('lesson') || '');
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [mode, setMode] = useState<'cut' | 'frontback'>('cut');
  const [count, setCount] = useState(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons().then(ls => {
      setLessons(ls);
      if (!lessonId && ls.length > 0) setLessonId(ls[0].id);
    }).catch(() => setLessons([])).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lessonId) fetchVocabulary(lessonId).then(v => setVocab(v as VocabRow[])).catch(() => setVocab([]));
  }, [lessonId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div></div>;
  }

  const cards = vocab.slice(0, count);

  return (
    <div className="max-w-[860px] mx-auto px-6 py-8 print:p-0 print:max-w-none">
      <div className="print:hidden">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Layers className="text-[#FF3333]" /> {t('fcp.title')}
        </motion.h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>{t('fcp.subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select value={lessonId} onChange={e => setLessonId(e.target.value)} className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF3333]/50">
            {lessons.map(l => <option key={l.id} value={l.id}>{l.order_num}. {isAr ? l.title_ar : l.title_en}</option>)}
          </select>
          <select value={count} onChange={e => setCount(Number(e.target.value))} className="bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none">
            {[6, 9, 12, 18].map(n => <option key={n} value={n}>{n} {t('dict.words')}</option>)}
          </select>
          <div className="flex gap-1 liquid-glass rounded-xl p-1">
            <button onClick={() => setMode('cut')} className={`px-4 py-2 rounded-lg text-xs font-display font-semibold ${mode === 'cut' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0]'}`}>{t('fcp.cut')}</button>
            <button onClick={() => setMode('frontback')} className={`px-4 py-2 rounded-lg text-xs font-display font-semibold ${mode === 'frontback' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0]'}`}>{t('fcp.frontback')}</button>
          </div>
          <button onClick={() => window.print()} className="btn-primary text-sm py-2 px-5"><Printer size={15} /> {t('worksheet.print')}</button>
        </div>
      </div>

      <div className="bg-white text-black rounded-2xl p-6 print:rounded-none fc-sheet">
        <style>{`
          @media print { body * { visibility: hidden; } .fc-sheet, .fc-sheet * { visibility: visible; } .fc-sheet { position: absolute; left: 0; top: 0; width: 100%; } .fc-pgbrk { page-break-before: always; } }
          .fc-card { border: 1.6px dashed #888; min-height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; }
        `}</style>
        {mode === 'cut' ? (
          <>
            <p className="text-xs text-gray-600 mb-3">✂️ {t('fcp.cutNote')}</p>
            <div className="grid grid-cols-3 gap-2">
              {cards.map(v => (
                <div key={v.id} className="fc-card">
                  <p className="text-4xl mb-1">{v.chinese}</p>
                  <p className="text-xs" dir="ltr">{v.pinyin}</p>
                  <p className="text-xs" dir="rtl">{v.arabic}</p>
                  <p className="text-[10px] text-gray-600">{v.english}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-600 mb-3">{t('fcp.fbNote')}</p>
            <div className="grid grid-cols-3 gap-2">
              {cards.map(v => <div key={v.id} className="fc-card"><p className="text-5xl">{v.chinese}</p></div>)}
            </div>
            <div className="fc-pgbrk mt-6" />
            <p className="text-xs text-gray-600 my-3">{t('fcp.backNote')}</p>
            <div className="grid grid-cols-3 gap-2" dir="rtl">
              {cards.map(v => (
                <div key={v.id} className="fc-card">
                  <p className="text-base" dir="ltr">{v.pinyin}</p>
                  <p className="text-lg">{v.arabic}</p>
                  <p className="text-xs text-gray-600" dir="ltr">{v.english}</p>
                </div>
              ))}
            </div>
          </>
        )}
        <p className="text-[10px] text-gray-500 mt-6 text-center">© NiHao — cnihao.com</p>
      </div>
    </div>
  );
}

/** V2.2.1 /dictation — classroom dictation (听写) with TTS, repeat, slow speed, reveal */
export function Dictation() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [lessonId, setLessonId] = useState('');
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [mode, setMode] = useState<'vocab' | 'sentences'>('vocab');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons().then(ls => {
      setLessons(ls);
      if (ls.length > 0) setLessonId(ls[0].id);
    }).catch(() => setLessons([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!lessonId) return;
    Promise.all([
      fetchVocabulary(lessonId).catch(() => []),
      fetchSentences(lessonId).catch(() => []),
    ]).then(([v, s]) => {
      setVocab(v as VocabRow[]);
      setSentences(s as SentenceRow[]);
      setIndex(0);
      setRevealed(false);
    });
  }, [lessonId]);

  const items = mode === 'vocab'
    ? vocab.map(v => ({ zh: v.chinese, py: v.pinyin, ar: v.arabic, en: v.english }))
    : sentences.map(s => ({ zh: s.chinese, py: s.pinyin, ar: s.arabic, en: s.english }));
  const item = items[index];

  const speak = (rate: number) => {
    if (!item) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(item.zh);
      u.lang = 'zh-CN';
      u.rate = rate;
      window.speechSynthesis.speak(u);
    } catch { play(item.zh); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div></div>;
  }

  return (
    <div className="max-w-[600px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Headphones className="text-[#FF3333]" /> {t('dictation.title')} 听写
        </h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>{t('dictation.subtitle')}</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={lessonId} onChange={e => setLessonId(e.target.value)} className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FF3333]/50">
          {lessons.map(l => <option key={l.id} value={l.id}>{l.order_num}. {isAr ? l.title_ar : l.title_en}</option>)}
        </select>
        <div className="flex gap-1 liquid-glass rounded-xl p-1">
          <button onClick={() => { setMode('vocab'); setIndex(0); setRevealed(false); }} className={`px-4 py-2 rounded-lg text-xs font-display font-semibold ${mode === 'vocab' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0]'}`}>{t('dictation.words')}</button>
          <button onClick={() => { setMode('sentences'); setIndex(0); setRevealed(false); }} className={`px-4 py-2 rounded-lg text-xs font-display font-semibold ${mode === 'sentences' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0]'}`}>{t('dictation.sentences')}</button>
        </div>
      </div>

      {!item ? (
        <p className={`text-center py-10 text-sm ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>{t('courses.offlineNote')}</p>
      ) : (
        <div className="liquid-glass p-8 text-center">
          <p className="text-xs mb-5" style={{ color: 'var(--color-text-tertiary)' }}>{index + 1} / {items.length}</p>
          <div className="flex justify-center gap-3 mb-6">
            <button onClick={() => speak(0.9)} className="w-20 h-20 rounded-full bg-[#FF3333] hover:bg-[#ff5555] flex items-center justify-center transition-colors" aria-label="play">
              <Volume2 size={30} className="text-white" />
            </button>
            <button onClick={() => speak(0.55)} className="w-20 h-20 rounded-full bg-white/5 border border-white/10 hover:border-[#FF3333]/40 flex items-center justify-center transition-colors" aria-label="slow">
              <Turtle size={28} className="text-white" />
            </button>
          </div>
          <p className="text-xs mb-6" style={{ color: 'var(--color-text-tertiary)' }}>{t('dictation.instruction')}</p>

          {revealed ? (
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 mb-5">
              <p className="font-chinese text-3xl text-white mb-1">{item.zh}</p>
              <PinyinText size="base" className="text-center">{item.py}</PinyinText>
              <p className="text-sm font-arabic text-white mt-1" dir="rtl">{item.ar}</p>
              {item.en && <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.en}</p>}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 mb-5">
              <p className="text-2xl">✍️</p>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button onClick={() => setRevealed(r => !r)} className="btn-secondary text-sm py-2 px-4">
              {revealed ? <><EyeOff size={14} /> {t('dictation.hide')}</> : <><Eye size={14} /> {t('dictation.reveal')}</>}
            </button>
            <button onClick={() => { setIndex(x => (x + 1) % items.length); setRevealed(false); }} className="btn-primary text-sm py-2 px-4">
              {t('listening.next')} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardsPrint;
