import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenLine, Printer, Volume2 } from 'lucide-react';
import StrokeOrderPlayer from '@/components/StrokeOrderPlayer';
import PinyinText from '@/components/PinyinText';
import { useAudio } from '@/hooks/useAudio';
import { writingChars } from '@/data/writingChars';
import { trackEvent } from '@/lib/analytics';
import Seo from '@/components/Seo';

/** V3.3 /writing-practice — original stroke-order + writing practice for common
 *  HSK1–HSK3 characters. Stroke animation via the existing StrokeOrderPlayer
 *  (hanzi-writer, already a dependency). No copyrighted book content. */
export default function WritingPractice() {
  const { play } = useAudio();
  const [selected, setSelected] = useState(writingChars[0]);

  useEffect(() => { trackEvent('writing_practice_start', {}); }, []);

  const pickChar = (c: typeof writingChars[number]) => {
    setSelected(c);
    trackEvent('writing_character_view', { content_slug: c.chinese, hsk: c.hsk });
  };

  // single hanzi only get the animated stroke player
  const isSingle = [...selected.chinese].length === 1;

  return (
    <div className="max-w-[820px] mx-auto px-6 py-8 print:p-0">
      <Seo />
      <div className="flex items-center justify-between mb-5 print:hidden" dir="rtl">
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <PenLine size={22} className="text-[#FF3333]" /> تدريب كتابة الأحرف
        </h1>
        <button onClick={() => window.print()} className="btn-primary text-sm py-2 px-4 inline-flex font-arabic">
          <Printer size={15} /> اطبع
        </button>
      </div>
      <p className="text-xs font-arabic mb-5 print:hidden" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>
        اختر حرفاً لمشاهدة ترتيب الكتابة الصحيح، ثم تدرّب عليه في الشبكة. اكتب كل حرف 3 مرات على الأقل. يمكنك طباعة الصفحة للتدريب على الورق.
      </p>

      {/* character chips */}
      <div className="flex flex-wrap gap-1.5 mb-6 print:hidden" dir="rtl">
        {writingChars.map(c => (
          <button
            key={c.chinese}
            onClick={() => pickChar(c)}
            className={`font-chinese text-lg w-11 h-11 rounded-lg border transition-colors ${selected.chinese === c.chinese ? 'border-[#FF3333]/60 bg-[#FF3333]/15 text-white' : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]'}`}
          >
            {c.chinese}
          </button>
        ))}
      </div>

      {/* selected character detail */}
      <div className="liquid-glass rounded-2xl p-6 mb-6 print:hidden" dir="rtl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            {isSingle ? (
              <StrokeOrderPlayer character={selected.chinese} size={200} />
            ) : (
              <p className="font-chinese text-7xl text-white">{selected.chinese}</p>
            )}
          </div>
          <div className="text-center sm:text-right flex-1">
            <p className="font-chinese text-4xl text-white mb-1">{selected.chinese}</p>
            <PinyinText className="text-lg block mb-1">{selected.pinyin}</PinyinText>
            <p className="font-arabic text-white text-lg mb-2">{selected.arabic}</p>
            <div className="flex items-center gap-3 justify-center sm:justify-start text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>
              <span>عدد الشَّخْطات: {selected.strokes}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF3333]/15 text-[#FF3333]">HSK{selected.hsk}</span>
              <button onClick={() => play(selected.chinese)} className="flex items-center gap-1 hover:text-white"><Volume2 size={13} /> استمع</button>
            </div>
            <p className="font-arabic text-sm mt-4 text-[#f59e0b]">✍️ اكتب هذا الحرف 3 مرات في الشبكة بالأسفل.</p>
          </div>
        </div>
      </div>

      {/* printable practice grid (white, like worksheets) */}
      <div className="bg-white text-black rounded-2xl p-6 print:rounded-none print:p-4">
        <style>{`
          @media print {
            body { background: #fff; }
            .tianzige { border-color: #ccc !important; }
          }
          .tianzige { position: relative; }
          .tianzige::before, .tianzige::after { content: ''; position: absolute; background: repeating-linear-gradient(to right,#e5b4b4 0,#e5b4b4 4px,transparent 4px,transparent 8px); }
          .tianzige::before { left: 50%; top: 0; bottom: 0; width: 1px; transform: translateX(-50%); background: repeating-linear-gradient(to bottom,#e5b4b4 0,#e5b4b4 4px,transparent 4px,transparent 8px); }
          .tianzige::after { top: 50%; left: 0; right: 0; height: 1px; transform: translateY(-50%); }
        `}</style>
        <div className="text-center mb-4" dir="rtl">
          <span className="font-chinese text-3xl">{selected.chinese}</span>
          <span className="mx-2 text-sm" style={{ direction: 'ltr', display: 'inline-block' }}>{selected.pinyin}</span>
          <span className="font-arabic text-sm">— {selected.arabic}</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="tianzige aspect-square border border-[#ddd] rounded flex items-center justify-center">
              {i === 0 && <span className="font-chinese text-3xl text-[#bbb]">{selected.chinese}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs font-arabic print:hidden" dir="rtl">
        <Link to="/flashcards/hsk3" className="text-[#FF3333] hover:underline">بطاقات HSK3</Link>
        <Link to="/dictionary" className="text-[#a0a0a0] hover:text-white">القاموس</Link>
        <Link to="/practice" className="text-[#a0a0a0] hover:text-white">كل التمارين</Link>
      </div>
    </div>
  );
}
