import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, Link2, Printer, FileText, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { articles } from '@/data/articles';
import { seoArticleBySlug } from '@/data/seoSprint1b';
import SeoArticleView from '@/pages/SeoArticleView';
import { fetchLessons } from '@/lib/dataService';
import type { LessonRow } from '@/types/supabase';

/** V2.2 /blog/:slug — Arabic SEO article page with FAQ + internal links */
export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  // V2.6: keyword-targeted SEO sprint articles take priority at /blog/:slug
  const seoArticle = slug ? seoArticleBySlug(slug) : undefined;
  const article = articles.find(a => a.slug === slug);

  useEffect(() => {
    if (article) document.title = `${article.title} | NiHao`;
    return () => { document.title = 'NiHao'; };
  }, [article]);

  if (seoArticle) return <SeoArticleView article={seoArticle} />;

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-white mb-4">{t('blog.notFound')}</p>
        <Link to="/blog" className="btn-primary text-sm">{t('blog.all')}</Link>
      </div>
    );
  }

  const related = articles.filter(a => article.related.includes(a.slug));

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8" dir="rtl">
      <Link to="/blog" className="btn-secondary text-xs py-2 px-4 inline-flex mb-6" dir="ltr"><ArrowLeft size={13} /> {t('blog.all')}</Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-5xl block mb-4">{article.emoji}</span>
        <h1 className="font-display font-black text-3xl text-white mb-3 font-arabic leading-snug">{article.title}</h1>
        <p className="text-sm font-arabic mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{article.intro}</p>

        {article.sections.map(s => (
          <section key={s.h} className="mb-7">
            <h2 className="font-display font-bold text-xl text-white mb-2 font-arabic">{s.h}</h2>
            <p className="text-base font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{s.p}</p>
          </section>
        ))}

        {/* Internal links */}
        <div className="liquid-glass p-5 rounded-2xl mb-8">
          <p className="text-sm font-display font-bold text-white mb-3 font-arabic flex items-center gap-2"><Link2 size={15} className="text-[#FF3333]" /> {t('blog.tools')}</p>
          <div className="flex flex-wrap gap-2">
            {article.links.map(l => (
              <Link key={l.path} to={l.path} className="btn-secondary text-xs py-2 px-4 font-arabic">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <h2 className="font-display font-bold text-xl text-white mb-4 font-arabic flex items-center gap-2"><HelpCircle size={18} className="text-[#FF3333]" /> {t('blog.faq')}</h2>
        <div className="space-y-3 mb-10">
          {article.faq.map(f => (
            <div key={f.q} className="liquid-glass p-4 rounded-xl">
              <p className="text-sm font-bold text-white font-arabic mb-1">{f.q}</p>
              <p className="text-sm font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <>
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic">{t('blog.related')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map(r => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="liquid-glass p-4 rounded-xl hover:border-[#FF3333]/30 border border-transparent transition-colors">
                  <span className="text-2xl block mb-2">{r.emoji}</span>
                  <p className="text-xs font-bold text-white font-arabic leading-snug">{r.title}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </motion.article>
    </div>
  );
}

/** V2.2 /worksheets — printable worksheets index (one per lesson) */
export function WorksheetsIndex() {
  const { t, lang } = useI18n();
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons().then(setLessons).catch(() => setLessons([])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <FileText className="text-[#FF3333]" /> {t('ws.title')}
        </h1>
        <p className={`text-sm mb-8 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('ws.subtitle')}
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {lessons.map(l => (
          <Link key={l.id} to={`/worksheet/${l.id}`} className="liquid-glass p-4 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors flex items-center gap-3">
            <Printer size={18} className="text-[#FF3333] shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-display font-bold text-white">{t('courses.lesson')} {l.order_num}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{lang === 'ar' ? l.title_ar : l.title_en}</p>
            </div>
          </Link>
        ))}
        {lessons.length === 0 && (
          <p className={`col-span-full text-center py-10 text-sm ${lang === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-tertiary)' }}>{t('courses.offlineNote')}</p>
        )}
      </div>
    </div>
  );
}

export default ArticlePage;
