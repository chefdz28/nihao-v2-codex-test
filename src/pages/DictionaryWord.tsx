import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Volume2, BookA, Layers, MessagesSquare, BookOpenText, Hash, GraduationCap } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, definedTermLd } from '@/lib/structuredData';
import { wordBySlug, dictionaryWords } from '@/data/dictionaryCore';
import { findUsages } from '@/lib/wordUsages';
import SocialShareButtons from '@/components/SocialShareButtons';
import { trackEvent } from '@/lib/analytics';

/** V2.8A /dictionary/:slug — individual reference page for one word. */
export default function DictionaryWord() {
  const { slug } = useParams<{ slug: string }>();
  const { play } = useAudio();
  const word = slug ? wordBySlug(slug) : undefined;

  useEffect(() => {
    if (word) {
      document.title = `${word.chinese} (${word.pinyin}) — ${word.arabic} | NiHao`;
      const desc = `معنى ${word.chinese} (${word.pinyin}) بالعربية: ${word.arabic}. كلمة من مستوى HSK${word.hsk} مع النطق والأمثلة على NiHao.`;
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
      m.setAttribute('content', desc);
      trackEvent('dictionary_word_view', { content_slug: word.slug, hsk: word.hsk });
    }
    return () => { document.title = 'NiHao'; };
  }, [word]);

  if (!word) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-white mb-4 font-arabic">الكلمة غير موجودة في القاموس.</p>
        <Link to="/dictionary" className="btn-primary text-sm font-arabic">العودة للقاموس</Link>
      </div>
    );
  }

  const related = word.related.map(s => wordBySlug(s)).filter(Boolean) as typeof dictionaryWords;
  const usages = findUsages(word.chinese);

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8" dir="rtl">
      <JsonLd id="word-breadcrumb" data={breadcrumbLd([
        { name: 'الرئيسية', path: '/' },
        { name: 'القاموس', path: '/dictionary' },
        { name: word.chinese, path: `/dictionary/${word.slug}` },
      ])} />
      <JsonLd id="word-term" data={definedTermLd({
        term: word.chinese, definition: word.arabic, pinyin: word.pinyin, path: `/dictionary/${word.slug}`,
      })} />

      <Link to="/dictionary" className="btn-secondary text-xs py-2 px-4 inline-flex mb-6 font-arabic"><ArrowLeft size={13} /> القاموس</Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero card */}
        <div className="liquid-glass rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-[11px] px-3 py-1 rounded-full bg-[#FF3333]/15 text-[#FF3333] font-display font-bold flex items-center gap-1">
              <Hash size={11} /> HSK{word.hsk}
            </span>
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 text-[#a0a0a0] font-arabic">{word.category}</span>
          </div>
          <h1 className="font-chinese text-7xl text-white mb-3">{word.chinese}</h1>
          <button onClick={() => play(word.chinese)} className="inline-flex items-center gap-2 mb-3 text-[#FF3333]">
            <Volume2 size={20} /> <PinyinText size="lg">{word.pinyin}</PinyinText>
          </button>
          <p className="text-2xl font-bold text-white font-arabic mt-2">{word.arabic}</p>
          {word.english && <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{word.english}</p>}
        </div>

        {/* Examples */}
        {word.examples.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><BookA size={18} className="text-[#FF3333]" /> أمثلة</h2>
            <div className="space-y-2">
              {word.examples.map((ex, i) => (
                <button key={i} onClick={() => play(ex.zh)} className="w-full liquid-glass rounded-2xl p-4 text-right hover:bg-white/[0.06] transition-colors flex items-center gap-3">
                  <Volume2 size={15} className="text-[#888] shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="font-chinese text-xl text-white block">{ex.zh}</span>
                    <PinyinText>{ex.py}</PinyinText>
                    <span className="text-sm font-arabic text-white block mt-1">{ex.ar}</span>
                    {ex.en && <span className="text-xs block" style={{ color: 'var(--color-text-tertiary)' }}>{ex.en}</span>}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Used in stories / dialogues */}
        {usages.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><BookOpenText size={18} className="text-[#FF3333]" /> تظهر في</h2>
            <div className="flex flex-wrap gap-2">
              {usages.map((u, i) => (
                <Link key={i} to={u.path} className="liquid-glass rounded-xl px-4 py-2.5 text-sm font-arabic text-white hover:border-[#FF3333]/30 border border-transparent transition-colors inline-flex items-center gap-2">
                  {u.type === 'story' ? <BookOpenText size={14} className="text-[#FF3333]" /> : u.type === 'lesson' ? <GraduationCap size={14} className="text-[#FF3333]" /> : <MessagesSquare size={14} className="text-[#FF3333]" />}
                  {u.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related words */}
        {related.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><Layers size={18} className="text-[#FF3333]" /> كلمات ذات صلة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {related.map(r => (
                <Link key={r.slug} to={`/dictionary/${r.slug}`} className="liquid-glass rounded-2xl p-4 text-center hover:border-[#FF3333]/30 border border-transparent transition-colors">
                  <span className="font-chinese text-2xl text-white block mb-1">{r.chinese}</span>
                  <PinyinText>{r.pinyin}</PinyinText>
                  <span className="text-xs font-arabic block mt-1" style={{ color: 'var(--color-text-secondary)' }}>{r.arabic}</span>
                </Link>
              ))}
            </div>
          </section>
        )}


        {/* V3.0A: share */}
        <div className="mb-6">
          <SocialShareButtons title={`${word.chinese} — ${word.arabic}`} compact />
        </div>

        <Link to="/courses" className="btn-primary text-sm py-3 px-6 inline-flex font-arabic mt-2">تعلّم المزيد من الكلمات <ArrowRight size={15} /></Link>
      </motion.div>
    </div>
  );
}
