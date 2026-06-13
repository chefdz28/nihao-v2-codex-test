import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, Printer, Presentation, Layers, Headphones, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { fetchLessons, fetchVocabulary, fetchSentences } from '@/lib/dataService';
import { fetchLessonGrammar } from '@/lib/grammarService';
import type { LessonRow, VocabRow, SentenceRow } from '@/types/supabase';
import type { GrammarPoint } from '@/types/grammar';

/**
 * V2.2.1 /teacher — Teacher Lesson Pack: pick a lesson, print everything a
 * classroom needs in one go: vocab table, sentences, grammar points,
 * exercises + answer key, mini quiz, dictation list and cut-out flashcards.
 */
export default function Teacher() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [lessonId, setLessonId] = useState('');
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [grammar, setGrammar] = useState<GrammarPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetchLessons().then(ls => {
      setLessons(ls);
      if (ls.length > 0) setLessonId(ls[0].id);
    }).catch(() => setLessons([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!lessonId) return;
    const orderNum = lessons.find(l => l.id === lessonId)?.order_num || 0;
    Promise.all([
      fetchVocabulary(lessonId).catch(() => []),
      fetchSentences(lessonId).catch(() => []),
      fetchLessonGrammar(lessonId, orderNum).then(g => g.points).catch(() => []),
    ]).then(([v, s, g]) => {
      setVocab((v as VocabRow[]).slice(0, 12));
      setSentences((s as SentenceRow[]).slice(0, 6));
      setGrammar((g as GrammarPoint[]).slice(0, 3));
    });
  }, [lessonId, lessons]);

  const lesson = lessons.find(l => l.id === lessonId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  const fillItems = vocab.slice(0, 4);
  const matchItems = vocab.slice(0, 5);
  const dictation = [...vocab.slice(0, 6).map(v => ({ zh: v.chinese, py: v.pinyin })), ...sentences.slice(0, 2).map(s => ({ zh: s.chinese, py: s.pinyin }))];

  return (
    <div className="max-w-[860px] mx-auto px-6 py-8 print:p-0 print:max-w-none">
      {/* Screen toolbar */}
      <div className="print:hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
            <School className="text-[#FF3333]" /> {t('teacher.title')}
          </h1>
          <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
            {t('teacher.subtitle')}
          </p>
        </motion.div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select value={lessonId} onChange={e => setLessonId(e.target.value)}
            className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#FF3333]/50 outline-none">
            {lessons.map(l => <option key={l.id} value={l.id}>{l.order_num}. {isAr ? l.title_ar : l.title_en}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setShowKey(k => !k)} className="btn-secondary text-sm py-2 px-4">{showKey ? t('ws.hideKey') : t('ws.showKey')}</button>
            <button onClick={() => window.print()} className="btn-primary text-sm py-2 px-5"><Printer size={15} /> {t('teacher.printPack')}</button>
          </div>
        </div>
        {lesson && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link to={`/present/${lesson.id}`} className="btn-secondary text-xs py-2 px-4"><Presentation size={13} /> {t('teacher.presentMode')}</Link>
            <Link to={`/flashcards-print?lesson=${lesson.id}`} className="btn-secondary text-xs py-2 px-4"><Layers size={13} /> {t('teacher.printCards')}</Link>
            <Link to="/dictation" className="btn-secondary text-xs py-2 px-4"><Headphones size={13} /> {t('teacher.dictation')}</Link>
          </div>
        )}
      </div>

      {/* THE PACK (print sheet) */}
      {lesson && (
        <div className="bg-white text-black rounded-2xl p-8 print:rounded-none print:p-6 pack-sheet">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .pack-sheet, .pack-sheet * { visibility: visible; }
              .pack-sheet { position: absolute; left: 0; top: 0; width: 100%; }
              .pack-break { page-break-before: always; }
            }
            .pk-box { width: 48px; height: 48px; border: 1.4px solid #c9b28a; display: inline-block; }
            .pk-line { border-bottom: 1.4px solid #999; min-height: 26px; }
            .pk-card { border: 1.5px dashed #999; padding: 10px; text-align: center; }
          `}</style>

          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
            <div>
              <h1 className="font-bold text-xl">NiHao · {t('teacher.packHeading')}</h1>
              <p className="text-sm text-gray-700">{lesson.order_num}. {lesson.title_en} · {lesson.title_ar}</p>
            </div>
            <p className="text-xs text-gray-600">cnihao.com</p>
          </div>

          {/* 1. Vocabulary table */}
          <h2 className="font-bold text-base mb-2">1. {t('teacher.vocabTable')}</h2>
          <table className="w-full text-sm border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-gray-400 text-left">
                <th className="py-1 pe-3">汉字</th><th className="py-1 pe-3">Pinyin</th><th className="py-1 pe-3">العربية</th><th className="py-1">English</th>
              </tr>
            </thead>
            <tbody>
              {vocab.map(v => (
                <tr key={v.id} className="border-b border-gray-200">
                  <td className="py-1.5 pe-3 text-lg">{v.chinese}</td>
                  <td className="py-1.5 pe-3" dir="ltr">{v.pinyin}</td>
                  <td className="py-1.5 pe-3" dir="rtl">{v.arabic}</td>
                  <td className="py-1.5">{v.english}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 2. Sentences */}
          {sentences.length > 0 && (
            <>
              <h2 className="font-bold text-base mb-2">2. {t('teacher.sentences')}</h2>
              <div className="space-y-2 mb-6">
                {sentences.map(s => (
                  <p key={s.id} className="text-base">
                    <span className="text-lg">{s.chinese}</span>
                    <span className="text-xs text-gray-600" dir="ltr"> {s.pinyin}</span>
                    <span className="text-sm text-gray-700" dir="rtl"> — {s.arabic}</span>
                  </p>
                ))}
              </div>
            </>
          )}

          {/* 3. Grammar */}
          {grammar.length > 0 && (
            <>
              <h2 className="font-bold text-base mb-2">3. {t('teacher.grammar')}</h2>
              <div className="space-y-3 mb-6">
                {grammar.map(g => (
                  <div key={g.id}>
                    <p className="font-bold text-sm">{g.title_en} · {g.title_ar}</p>
                    <p className="text-base text-red-800">{g.pattern}</p>
                    <p className="text-xs text-gray-700" dir="rtl">{g.explanation_ar}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 4. Exercises */}
          <div className="pack-break" />
          <h2 className="font-bold text-base mb-2">4. {t('teacher.exercises')}</h2>
          <p className="text-sm font-bold mb-1">{t('ws.fillBlank')}:</p>
          <div className="space-y-1.5 mb-4">
            {fillItems.map((v, i) => (
              <p key={v.id} className="text-base">
                {i + 1}. {v.chinese.length > 1 ? v.chinese.charAt(0) + ' ___' : '___'}
                <span className="text-xs text-gray-600"> ({v.arabic})</span>
                {showKey && <span className="text-sm text-red-700 font-bold"> ← {v.chinese}</span>}
              </p>
            ))}
          </div>
          <p className="text-sm font-bold mb-1">{t('ws.matchPinyin')}:</p>
          <div className="grid grid-cols-2 gap-x-10 gap-y-1 max-w-md mb-4">
            {matchItems.map((v, i) => {
              const sh = matchItems[(i + 2) % matchItems.length];
              return (
                <div key={v.id} className="contents">
                  <p className="text-lg">{i + 1}. {v.chinese}</p>
                  <p className="text-sm pt-1" dir="ltr">( {showKey ? matchItems.findIndex(x => x.id === sh.id) + 1 : ' '} ) {sh.pinyin}</p>
                </div>
              );
            })}
          </div>
          <p className="text-sm font-bold mb-1">{t('teacher.writing')}:</p>
          <div className="space-y-2 mb-6">
            {vocab.slice(0, 4).map(v => (
              <div key={v.id} className="flex items-center gap-3">
                <span className="w-24 text-lg">{v.chinese}</span>
                <span className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="pk-box" />)}</span>
              </div>
            ))}
          </div>

          {/* 5. Mini quiz */}
          <h2 className="font-bold text-base mb-2">5. {t('ws.miniQuiz')}</h2>
          <div className="space-y-2 mb-6">
            {vocab.slice(0, 3).map((v, i) => {
              const opts = [v, vocab[(i + 1) % vocab.length], vocab[(i + 2) % vocab.length]];
              return (
                <div key={v.id}>
                  <p className="text-base">{i + 1}. {t('ws.whatMeans')} <span className="text-xl">{v.chinese}</span></p>
                  <p className="text-sm">
                    {opts.map((o, j) => (
                      <span key={o.id} className={showKey && o.id === v.id ? 'text-red-700 font-bold' : ''}>{'　'}{String.fromCharCode(65 + j)}) {o.arabic}</span>
                    ))}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 6. Dictation list (teacher reads / plays) */}
          <h2 className="font-bold text-base mb-2">6. {t('teacher.dictationList')}</h2>
          <p className="text-xs text-gray-600 mb-2">{t('teacher.dictationNote')}</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-6">
            {dictation.map((d, i) => (
              <p key={i} className="text-sm">
                {i + 1}. {showKey ? <><span className="text-lg">{d.zh}</span> <span className="text-xs text-gray-600" dir="ltr">{d.py}</span></> : <span className="pk-line inline-block w-40" />}
              </p>
            ))}
          </div>

          {/* 7. Cut-out flashcards */}
          <div className="pack-break" />
          <h2 className="font-bold text-base mb-2">7. {t('teacher.flashcards')} ✂️</h2>
          <div className="grid grid-cols-3 gap-2">
            {vocab.slice(0, 9).map(v => (
              <div key={v.id} className="pk-card">
                <p className="text-3xl mb-1">{v.chinese}</p>
                <p className="text-xs" dir="ltr">{v.pinyin}</p>
                <p className="text-xs" dir="rtl">{v.arabic}</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-500 mt-8 text-center">© NiHao — cnihao.com · {t('teacher.footer')}</p>
        </div>
      )}
      {!lesson && <p className={`text-center py-10 text-sm ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>{t('courses.offlineNote')}</p>}
    </div>
  );
}
