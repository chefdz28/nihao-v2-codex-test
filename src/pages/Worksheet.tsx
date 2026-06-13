import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { fetchLessons, fetchVocabulary, fetchSentences } from '@/lib/dataService';
import type { LessonRow, VocabRow, SentenceRow } from '@/types/supabase';

/**
 * V2.0.5 /worksheet/:lessonId — print-friendly practice sheet:
 * vocabulary with pinyin/AR/EN plus empty 田字格 writing boxes, sentence
 * translation lines, and a match section. White layout + @media print rules.
 */
export default function Worksheet() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { t } = useI18n();
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false); // V2.2: answer-key toggle

  useEffect(() => {
    async function load() {
      if (!lessonId) { setLoading(false); return; }
      try {
        const [lessons, v, s] = await Promise.all([
          fetchLessons(),
          fetchVocabulary(lessonId),
          fetchSentences(lessonId),
        ]);
        setLesson(lessons.find(l => l.id === lessonId) || null);
        setVocab(v.slice(0, 10));
        setSentences(s.slice(0, 5));
      } catch (err) {
        console.error('Worksheet load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <p className="text-white mb-4">{t('worksheet.notFound')}</p>
        <Link to="/courses" className="btn-primary text-sm">{t('lesson.backToCourses')}</Link>
      </div>
    );
  }

  const boxes = Array.from({ length: 6 });
  // V2.2: deterministic exercise material from lesson data
  const fillItems = vocab.slice(0, 4);
  const matchItems = vocab.slice(0, 5);
  const orderSentence = sentences[0];
  const orderWords = orderSentence ? orderSentence.chinese.replace(/[。！？]/g, '').split('').filter(Boolean) : [];

  return (
    <div className="max-w-[820px] mx-auto px-6 py-8 print:p-0 print:max-w-none">
      {/* Screen-only toolbar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to={`/courses/${lesson.level_id}/${lesson.id}`} className="btn-secondary text-sm py-2 px-4">
          <ArrowLeft size={14} /> {t('worksheet.backToLesson')}
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setShowKey(k => !k)} className="btn-secondary text-sm py-2 px-4">
            {showKey ? t('ws.hideKey') : t('ws.showKey')}
          </button>
          <button onClick={() => window.print()} className="btn-primary text-sm py-2 px-5">
            <Printer size={15} /> {showKey ? t('ws.printKey') : t('worksheet.print')}
          </button>
        </div>
      </div>

      {/* The sheet (white, print-friendly) */}
      <div className="bg-white text-black rounded-2xl p-8 print:rounded-none print:p-6 worksheet-sheet">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .worksheet-sheet, .worksheet-sheet * { visibility: visible; }
            .worksheet-sheet { position: absolute; left: 0; top: 0; width: 100%; }
          }
          .ws-box {
            width: 52px; height: 52px; border: 1.5px solid #c9b28a; position: relative; display: inline-block;
          }
          .ws-box::before, .ws-box::after {
            content: ''; position: absolute; background: transparent; border-color: #efd9b0;
          }
          .ws-box::before { left: 50%; top: 0; bottom: 0; border-left: 1px dashed #e8cfa3; }
          .ws-box::after { top: 50%; left: 0; right: 0; border-top: 1px dashed #e8cfa3; }
          .ws-line { border-bottom: 1.5px solid #999; min-height: 28px; }
        `}</style>

        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <div>
            <h1 className="font-bold text-xl">NiHao · {t('worksheet.title')}</h1>
            <p className="text-sm text-gray-700">{lesson.order_num}. {lesson.title_en} · {lesson.title_ar}</p>
          </div>
          <p className="text-xs text-gray-600">cnihao.com · {t('worksheet.name')}: ______________</p>
        </div>

        {/* Section 1: write the characters */}
        <h2 className="font-bold text-base mb-2">1. {t('worksheet.writeChars')}</h2>
        <div className="space-y-3 mb-6">
          {vocab.map(v => (
            <div key={v.id} className="flex items-center gap-3 flex-wrap">
              <div className="w-40 shrink-0">
                <span className="text-2xl">{v.chinese}</span>
                <span className="text-xs text-gray-600 block">{v.pinyin} · {v.english} · {v.arabic}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {boxes.map((_, i) => <span key={i} className="ws-box" />)}
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: translate */}
        {sentences.length > 0 && (
          <>
            <h2 className="font-bold text-base mb-2">2. {t('worksheet.translate')}</h2>
            <div className="space-y-4 mb-6">
              {sentences.map(s => (
                <div key={s.id}>
                  <p className="text-lg">{s.chinese} <span className="text-xs text-gray-600">({s.pinyin})</span></p>
                  <div className="ws-line" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Section 3: match */}
        {vocab.length >= 4 && (
          <>
            <h2 className="font-bold text-base mb-2">3. {t('worksheet.match')}</h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 max-w-md">
              {vocab.slice(0, 5).map((v, i) => (
                <div key={v.id} className="contents">
                  <p className="text-lg">{i + 1}. {v.chinese}</p>
                  <p className="text-sm pt-1.5">( ) {vocab.slice(0, 5)[(i + 2) % Math.min(5, vocab.length)].english}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* V2.2: Section 4 — fill in the blank */}
        {fillItems.length >= 3 && (
          <>
            <h2 className="font-bold text-base mb-2 mt-6">4. {t('ws.fillBlank')}</h2>
            <div className="space-y-2 mb-6">
              {fillItems.map((v, i) => (
                <p key={v.id} className="text-base">
                  {i + 1}. {v.chinese.length > 1 ? v.chinese.charAt(0) + ' ___' : '___'}
                  <span className="text-xs text-gray-600"> ({v.arabic} · {v.english})</span>
                  {showKey && <span className="text-sm text-red-700 font-bold"> ← {v.chinese}</span>}
                </p>
              ))}
            </div>
          </>
        )}

        {/* V2.2: Section 5 — match Chinese to Pinyin */}
        {matchItems.length >= 4 && (
          <>
            <h2 className="font-bold text-base mb-2">5. {t('ws.matchPinyin')}</h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-1.5 max-w-md mb-6">
              {matchItems.map((v, i) => {
                const shifted = matchItems[(i + 2) % matchItems.length];
                return (
                  <div key={v.id} className="contents">
                    <p className="text-lg">{i + 1}. {v.chinese}</p>
                    <p className="text-sm pt-1.5" dir="ltr">( {showKey ? matchItems.findIndex(x => x.id === shifted.id) + 1 : ' '} ) {shifted.pinyin}</p>
                  </div>
                );
              })}
            </div>

            <h2 className="font-bold text-base mb-2">6. {t('ws.matchArabic')}</h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-1.5 max-w-md mb-6">
              {matchItems.map((v, i) => {
                const shifted = matchItems[(i + 3) % matchItems.length];
                return (
                  <div key={v.id} className="contents">
                    <p className="text-base" dir="ltr">{i + 1}. {v.pinyin}</p>
                    <p className="text-sm pt-0.5">( {showKey ? matchItems.findIndex(x => x.id === shifted.id) + 1 : ' '} ) {shifted.arabic}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* V2.2: Section 7 — sentence order */}
        {orderSentence && orderWords.length >= 3 && (
          <>
            <h2 className="font-bold text-base mb-2">7. {t('ws.sentenceOrder')}</h2>
            <p className="text-lg mb-1">{[...orderWords].reverse().join(' / ')}</p>
            <p className="text-xs text-gray-600 mb-1">({orderSentence.arabic} · {orderSentence.english})</p>
            {showKey ? (
              <p className="text-base text-red-700 font-bold mb-6">← {orderSentence.chinese}</p>
            ) : (
              <div className="ws-line mb-6" />
            )}
          </>
        )}

        {/* V2.2: Section 8 — mini quiz */}
        {vocab.length >= 3 && (
          <>
            <h2 className="font-bold text-base mb-2">8. {t('ws.miniQuiz')}</h2>
            <div className="space-y-2 mb-6">
              {vocab.slice(0, 3).map((v, i) => {
                const opts = [v, vocab[(i + 1) % vocab.length], vocab[(i + 2) % vocab.length]];
                return (
                  <div key={v.id}>
                    <p className="text-base mb-0.5">{i + 1}. {t('ws.whatMeans')} <span className="text-xl">{v.chinese}</span> ?</p>
                    <p className="text-sm">
                      {opts.map((o, j) => (
                        <span key={o.id} className={showKey && o.id === v.id ? 'text-red-700 font-bold' : ''}>
                          {'　'}{String.fromCharCode(65 + j)}) {o.arabic} / {o.english}
                        </span>
                      ))}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {showKey && <p className="text-xs text-red-700 font-bold mt-4">{t('ws.keyNote')}</p>}

        <p className="text-[10px] text-gray-500 mt-8 text-center">© NiHao — cnihao.com · {t('worksheet.footer')}</p>
      </div>
    </div>
  );
}
