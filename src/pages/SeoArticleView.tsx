import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, HelpCircle, Link2, AlertTriangle, Volume2 } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import JsonLd from '@/components/JsonLd';
import { faqLd, breadcrumbLd, articleLd } from '@/lib/structuredData';
import { seoArticleBySlug } from '@/data/seoSprint1b';
import type { SeoArticle } from '@/data/seoSprint1';

/** V2.6 — renders a keyword-targeted SEO sprint article (rich block content) */
export default function SeoArticleView({ article }: { article: SeoArticle }) {
  const { play } = useAudio();

  useEffect(() => {
    document.title = `${article.title} | NiHao`;
    return () => { document.title = 'NiHao'; };
  }, [article]);

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8" dir="rtl">
      <JsonLd id="seo-breadcrumb" data={breadcrumbLd([
        { name: 'الرئيسية', path: '/' },
        { name: 'المدونة', path: '/blog' },
        { name: article.title, path: `/blog/${article.slug}` },
      ])} />
      <JsonLd id="seo-faq" data={faqLd([{ q: article.title, a: article.direct }, ...article.faq])} />
      <JsonLd id="seo-article" data={articleLd({ headline: article.title, description: article.meta, path: `/blog/${article.slug}`, dateModified: article.updated })} />

      <Link to="/blog" className="btn-secondary text-xs py-2 px-4 inline-flex mb-6 font-arabic"><ArrowLeft size={13} /> كل المقالات</Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-5xl block mb-4">{article.emoji}</span>
        <h1 className="font-display font-black text-3xl text-white mb-4 font-arabic leading-snug">{article.title}</h1>

        {/* Direct answer */}
        <div className="rounded-2xl border border-[#10b981]/30 bg-[#10b981]/5 p-5 mb-6">
          <p className="text-base font-arabic leading-relaxed text-white">{article.direct}</p>
        </div>

        {/* Content blocks */}
        {article.blocks.map((b, i) => {
          switch (b.type) {
            case 'h2':
              return <h2 key={i} className="font-display font-bold text-xl text-white mt-6 mb-2 font-arabic">{b.text}</h2>;
            case 'h3':
              return <h3 key={i} className="font-display font-bold text-lg text-white mt-4 mb-2 font-arabic">{b.text}</h3>;
            case 'p':
              return <p key={i} className="text-base font-arabic leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>{b.text}</p>;
            case 'note':
              return (
                <div key={i} className="rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4 flex items-start gap-3 mb-4">
                  <AlertTriangle size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
                  <p className="text-xs font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{b.text}</p>
                </div>
              );
            case 'list':
              return (
                <ul key={i} className="space-y-1.5 mb-4">
                  {b.items!.map((it, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="text-[#FF3333] mt-0.5 shrink-0">•</span> {it}
                    </li>
                  ))}
                </ul>
              );
            case 'costTable':
              return (
                <div key={i} className="liquid-glass rounded-2xl overflow-hidden mb-4">
                  {b.rows!.map((r, j) => (
                    <div key={j} className="flex items-start gap-3 p-3 border-b border-white/5 last:border-0">
                      <span className="text-sm font-bold text-white font-arabic w-40 shrink-0">{r.label}</span>
                      <span className="text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              );
            case 'phraseTable':
              return (
                <div key={i} className="mb-5">
                  {b.groupTitle && <h3 className="font-display font-bold text-base text-white mb-2 font-arabic">{b.groupTitle}</h3>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {b.phrases!.map((p, j) => (
                      <button key={j} onClick={() => play(p.zh)} className="flex items-center gap-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] p-3 transition-colors text-right">
                        <span className="font-chinese text-xl text-white shrink-0">{p.zh}</span>
                        <span className="flex-1 min-w-0">
                          <PinyinText>{p.py}</PinyinText>
                          <span className="text-sm font-arabic text-white block">{p.ar}</span>
                        </span>
                        <Volume2 size={14} className="text-[#888] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}

        {/* Internal links */}
        <div className="liquid-glass p-5 rounded-2xl my-6">
          <p className="text-sm font-display font-bold text-white mb-3 font-arabic flex items-center gap-2"><Link2 size={15} className="text-[#FF3333]" /> روابط مفيدة على NiHao</p>
          <div className="flex flex-wrap gap-2">
            {article.links.map(l => (
              <Link key={l.path} to={l.path} className="btn-secondary text-xs py-2 px-4 font-arabic">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <h2 className="font-display font-bold text-xl text-white mb-4 font-arabic flex items-center gap-2"><HelpCircle size={18} className="text-[#FF3333]" /> أسئلة شائعة</h2>
        <div className="space-y-3 mb-8">
          {article.faq.map(f => (
            <div key={f.q} className="liquid-glass p-4 rounded-xl">
              <p className="text-sm font-bold text-white font-arabic mb-1">{f.q}</p>
              <p className="text-sm font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* Related */}
        {article.related.length > 0 && (
          <>
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {article.related.map(slug => {
                const r = seoArticleBySlug(slug);
                return (
                  <Link key={slug} to={`/blog/${slug}`} className="liquid-glass p-3 rounded-xl hover:border-[#FF3333]/30 border border-transparent transition-colors flex items-center gap-2">
                    {r && <span className="text-xl">{r.emoji}</span>}
                    <span className="text-sm font-arabic text-white">{r ? r.title : slug}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <p className="text-[11px] font-arabic mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
          محتوى تعليمي من NiHao — ليس نصيحة رسمية جامعية أو قانونية. آخر تحديث: {article.updated}
        </p>

        <Link to="/courses" className="btn-primary text-sm py-3 px-6 inline-flex font-arabic">ابدأ تعلم الصينية الآن <ArrowRight size={15} /></Link>
      </motion.article>
    </div>
  );
}
