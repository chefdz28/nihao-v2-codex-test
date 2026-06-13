import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessagesSquare, ArrowLeft, ArrowRight, HelpCircle, Link2, ListChecks, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import JsonLd from '@/components/JsonLd';
import { faqLd, breadcrumbLd, articleLd } from '@/lib/structuredData';
import { answerPages, answerBySlug, ANSWER_CATEGORIES } from '@/data/answers';

void useI18n;

/** V2.5 /answers — AEO answer hub */
export default function Answers() {
  const [cat, setCat] = useState<string>('all');
  useEffect(() => {
    document.title = 'أسئلة وأجوبة عن تعلم الصينية والدراسة في الصين | NiHao';
    return () => { document.title = 'NiHao'; };
  }, []);

  const list = cat === 'all' ? answerPages : answerPages.filter(a => a.category === cat);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8" dir="rtl">
      <JsonLd id="answers-breadcrumb" data={breadcrumbLd([
        { name: 'الرئيسية', path: '/' },
        { name: 'أسئلة وأجوبة', path: '/answers' },
      ])} />
      <JsonLd id="answers-faq" data={faqLd(answerPages.map(a => ({ q: a.title, a: a.direct })))} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3 font-arabic">
          <MessagesSquare className="text-[#FF3333]" /> أسئلة وأجوبة عن تعلم الصينية والدراسة في الصين
        </h1>
        <p className="text-sm mb-6 font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          إجابات مباشرة ومختصرة لأكثر الأسئلة شيوعاً للمبتدئين العرب والطلاب الراغبين في الدراسة بالصين.
        </p>
      </motion.div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setCat('all')} className={`px-3 py-2 rounded-xl text-xs font-display font-semibold font-arabic transition-all ${cat === 'all' ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'}`}>الكل</button>
        {ANSWER_CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)} className={`px-3 py-2 rounded-xl text-xs font-display font-semibold font-arabic transition-all ${cat === c.key ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map(a => (
          <Link key={a.slug} to={`/answers/${a.slug}`} className="liquid-glass p-4 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors">
            <span className="text-2xl block mb-2">{a.emoji}</span>
            <p className="text-sm font-bold text-white font-arabic leading-snug mb-1">{a.title}</p>
            <p className="text-xs font-arabic leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{a.direct}</p>
          </Link>
        ))}
      </div>

      <div className="liquid-glass p-5 rounded-2xl mt-8 border border-[#FF3333]/20">
        <Link to="/best-chinese-learning-site-arabic" className="font-arabic text-white font-bold flex items-center gap-2">
          🏆 كيف تختار أفضل موقع عربي لتعلم الصينية؟ <ArrowRight size={15} className="text-[#FF3333]" />
        </Link>
      </div>
    </div>
  );
}

/** V2.5 /answers/:slug — single answer page */
export function AnswerPageView() {
  const { slug } = useParams<{ slug: string }>();
  const answer = slug ? answerBySlug(slug) : undefined;

  useEffect(() => {
    if (answer) document.title = `${answer.title} | NiHao`;
    return () => { document.title = 'NiHao'; };
  }, [answer]);

  if (!answer) {
    return (
      <div className="text-center py-20">
        <p className="text-white mb-4 font-arabic">السؤال غير موجود.</p>
        <Link to="/answers" className="btn-primary text-sm font-arabic">كل الأسئلة</Link>
      </div>
    );
  }

  const related = answerPages.filter(a => a.category === answer.category && a.slug !== answer.slug).slice(0, 3);

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8" dir="rtl">
      <JsonLd id="answer-breadcrumb" data={breadcrumbLd([
        { name: 'الرئيسية', path: '/' },
        { name: 'أسئلة وأجوبة', path: '/answers' },
        { name: answer.title, path: `/answers/${answer.slug}` },
      ])} />
      <JsonLd id="answer-faq" data={faqLd([{ q: answer.title, a: answer.direct }, ...answer.faq])} />
      <JsonLd id="answer-article" data={articleLd({ headline: answer.title, description: answer.meta, path: `/answers/${answer.slug}`, dateModified: answer.updated })} />

      <Link to="/answers" className="btn-secondary text-xs py-2 px-4 inline-flex mb-6 font-arabic"><ArrowLeft size={13} /> كل الأسئلة</Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-5xl block mb-4">{answer.emoji}</span>
        <h1 className="font-display font-black text-3xl text-white mb-4 font-arabic leading-snug">{answer.title}</h1>

        {/* Direct answer — highlighted for answer engines */}
        <div className="rounded-2xl border border-[#10b981]/30 bg-[#10b981]/5 p-5 mb-6">
          <p className="text-base font-arabic leading-relaxed text-white">{answer.direct}</p>
        </div>

        <p className="text-base font-arabic leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>{answer.explanation}</p>

        {/* Checklist */}
        <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><ListChecks size={18} className="text-[#FF3333]" /> قائمة عملية</h2>
        <ul className="space-y-1.5 mb-6">
          {answer.checklist.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={15} className="text-[#10b981] shrink-0 mt-0.5" /> {c}
            </li>
          ))}
        </ul>

        {answer.verifyNote && (
          <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4 flex items-start gap-3 mb-6">
            <AlertTriangle size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
            <p className="text-xs font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              الشروط والرسوم والمواعيد وقواعد التأشيرة تختلف وتتغير. تحقق دائماً من الموقع الرسمي للجامعة والسفارة الصينية في بلدك والبوابات الرسمية للمنح قبل اتخاذ أي قرار.
            </p>
          </div>
        )}

        {/* Internal links */}
        <div className="liquid-glass p-5 rounded-2xl mb-6">
          <p className="text-sm font-display font-bold text-white mb-3 font-arabic flex items-center gap-2"><Link2 size={15} className="text-[#FF3333]" /> روابط مفيدة على NiHao</p>
          <div className="flex flex-wrap gap-2">
            {answer.links.map(l => (
              <Link key={l.path} to={l.path} className="btn-secondary text-xs py-2 px-4 font-arabic">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <h2 className="font-display font-bold text-xl text-white mb-4 font-arabic flex items-center gap-2"><HelpCircle size={18} className="text-[#FF3333]" /> أسئلة شائعة</h2>
        <div className="space-y-3 mb-8">
          {answer.faq.map(f => (
            <div key={f.q} className="liquid-glass p-4 rounded-xl">
              <p className="text-sm font-bold text-white font-arabic mb-1">{f.q}</p>
              <p className="text-sm font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <>
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic">أسئلة ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {related.map(r => (
                <Link key={r.slug} to={`/answers/${r.slug}`} className="liquid-glass p-4 rounded-xl hover:border-[#FF3333]/30 border border-transparent transition-colors">
                  <span className="text-2xl block mb-2">{r.emoji}</span>
                  <p className="text-xs font-bold text-white font-arabic leading-snug">{r.title}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        <p className="text-[11px] font-arabic mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
          محتوى تعليمي من NiHao — ليس نصيحة رسمية جامعية أو قانونية. آخر تحديث: {answer.updated}
        </p>

        <Link to="/courses" className="btn-primary text-sm py-3 px-6 inline-flex font-arabic">ابدأ تعلم الصينية الآن <ArrowRight size={15} /></Link>
      </motion.article>
    </div>
  );
}
