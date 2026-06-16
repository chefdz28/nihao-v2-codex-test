import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Printer, RefreshCw, FileText } from 'lucide-react';
import { hsk3Batch } from '@/data/dictionaryHsk3';
import { trackEvent } from '@/lib/analytics';
import Seo from '@/components/Seo';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** V3.3 /worksheets/hsk3 — printable HSK3 vocabulary worksheet generator.
 *  Uses HSK3 dictionary data, CSS print styles, no PDF dependency. */
export default function Hsk3Worksheet() {
  const [seed, setSeed] = useState(0);

  useEffect(() => { trackEvent('writing_practice_start', { sheet: 'hsk3_worksheet' }); }, []);

  // pick 10 words per sheet
  const words = useMemo(() => shuffle(hsk3Batch).slice(0, 10), [seed]);
  const matchRight = useMemo(() => shuffle(words.map(w => w.arabic)), [words]);
  // mini quiz: 4 words, meaning → choose chinese
  const quiz = useMemo(() => {
    const picks = shuffle(words).slice(0, 4);
    return picks.map(p => {
      const distractors = shuffle(hsk3Batch.filter(w => w.chinese !== p.chinese)).slice(0, 2).map(w => w.chinese);
      return { arabic: p.arabic, correct: p.chinese, options: shuffle([p.chinese, ...distractors]) };
    });
  }, [words]);

  const regenerate = () => { setSeed(s => s + 1); trackEvent('worksheet_generate', { sheet: 'hsk3' }); };
  const print = () => { trackEvent('worksheet_print', { sheet: 'hsk3' }); window.print(); };

  return (
    <div className="max-w-[820px] mx-auto px-6 py-8 print:p-0 print:max-w-none">
      <Seo />
      <div className="flex items-center justify-between mb-6 print:hidden" dir="rtl">
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <FileText size={22} className="text-[#FF3333]" /> ورقة عمل HSK3
        </h1>
        <div className="flex gap-2">
          <button onClick={regenerate} className="btn-secondary text-sm py-2 px-4 inline-flex font-arabic"><RefreshCw size={14} /> ولّد جديدة</button>
          <button onClick={print} className="btn-primary text-sm py-2 px-4 inline-flex font-arabic"><Printer size={15} /> اطبع</button>
        </div>
      </div>

      {/* The printable sheet */}
      <div className="bg-white text-black rounded-2xl p-8 print:rounded-none print:p-6">
        <style>{`@media print { body { background:#fff; } .no-print { display:none; } }`}</style>
        <div className="text-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold" dir="rtl">ورقة عمل مفردات HSK3 — NiHao</h2>
          <p className="text-xs text-gray-500 mt-1" dir="rtl">الاسم: ____________________  التاريخ: ____________</p>
        </div>

        {/* Section 1: vocabulary + writing lines */}
        <section className="mb-6">
          <h3 className="font-bold text-sm mb-2" dir="rtl">١. المفردات — اكتب كل كلمة مرتين:</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 text-gray-600">
                <th className="text-right py-1 px-2" dir="rtl">المعنى</th>
                <th className="text-left py-1 px-2">Pinyin</th>
                <th className="text-center py-1 px-2">الحرف</th>
                <th className="text-center py-1 px-2 w-1/3">تدريب الكتابة</th>
              </tr>
            </thead>
            <tbody>
              {words.map((w, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="text-right py-2 px-2" dir="rtl">{w.arabic}</td>
                  <td className="text-left py-2 px-2" style={{ direction: 'ltr' }}>{w.pinyin}</td>
                  <td className="text-center py-2 px-2 text-2xl font-chinese">{w.chinese}</td>
                  <td className="py-2 px-2"><div className="border-b border-dashed border-gray-300 h-6" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 2: matching */}
        <section className="mb-6">
          <h3 className="font-bold text-sm mb-2" dir="rtl">٢. صِل الكلمة بمعناها:</h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div dir="ltr">
              {words.map((w, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className="text-gray-400 w-5">{i + 1}.</span>
                  <span className="font-chinese text-xl">{w.chinese}</span>
                  <span className="text-gray-400">______</span>
                </div>
              ))}
            </div>
            <div dir="rtl">
              {matchRight.map((ar, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className="text-gray-400 w-5">{String.fromCharCode(0x0623 + i)}.</span>
                  <span>{ar}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: mini quiz */}
        <section>
          <h3 className="font-bold text-sm mb-2" dir="rtl">٣. اختبار قصير — اختر الحرف الصحيح للمعنى:</h3>
          <div className="space-y-3 text-sm">
            {quiz.map((q, i) => (
              <div key={i} dir="rtl">
                <p className="mb-1">{i + 1}. ما الحرف الذي يعني «{q.arabic}»؟</p>
                <div className="flex gap-4 ps-4">
                  {q.options.map(opt => (
                    <label key={opt} className="flex items-center gap-1">
                      <span className="inline-block w-3.5 h-3.5 border border-gray-400 rounded-sm" />
                      <span className="font-chinese text-xl">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-[10px] text-gray-400 mt-8 pt-4 border-t border-gray-200">cnihao.com — تعلّم الصينية بالعربية</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs font-arabic print:hidden" dir="rtl">
        <Link to="/flashcards/hsk3" className="text-[#FF3333] hover:underline">بطاقات HSK3</Link>
        <Link to="/hsk3-simulation" className="text-[#a0a0a0] hover:text-white">اختبار HSK3</Link>
        <Link to="/dictionary" className="text-[#a0a0a0] hover:text-white">القاموس</Link>
      </div>
    </div>
  );
}
