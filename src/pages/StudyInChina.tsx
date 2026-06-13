import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, ArrowRight, HelpCircle, Link2, AlertTriangle, ListChecks, FileText, XCircle, Volume2, MapPin } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import { SIC_DISCLAIMER, SIC_PHRASES, SIC_LEARN_LINKS, SIC_CITIES } from '@/data/studyInChina';
import { sicArticles, sicArticleBySlug, sicGeneralSlugs, sicRegionalSlugs, sicBonusSlugs } from '@/data/sicArticles';
import { seoSprint1All } from '@/data/seoSprint1b';

function Disclaimer() {
  return (
    <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4 flex items-start gap-3" dir="rtl">
      <AlertTriangle size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
      <p className="text-xs font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{SIC_DISCLAIMER}</p>
    </div>
  );
}

function PhraseBlock() {
  const { play } = useAudio();
  return (
    <div className="liquid-glass p-5 rounded-2xl" dir="rtl">
      <h3 className="font-display font-bold text-white mb-3 font-arabic">عبارات صينية يحتاجها كل طالب عربي قبل السفر</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SIC_PHRASES.map(p => (
          <button key={p.zh} onClick={() => play(p.zh)} className="flex items-center gap-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] p-3 transition-colors text-right">
            <span className="font-chinese text-2xl text-white shrink-0">{p.zh}</span>
            <span className="flex-1 min-w-0">
              <PinyinText>{p.py}</PinyinText>
              <span className="text-sm font-arabic text-white block">{p.ar}</span>
            </span>
            <Volume2 size={15} className="text-[#888] shrink-0" />
          </button>
        ))}
      </div>
      <Link to="/dialogues" className="btn-secondary text-xs py-2 px-4 inline-flex mt-4 font-arabic">المزيد من الحوارات →</Link>
    </div>
  );
}

/** V2.4 /study-in-china — Arabic content hub */
export default function StudyInChina() {
  const { t } = useI18n();
  void t;
  useEffect(() => {
    document.title = 'الدراسة في الصين للطلاب العرب | NiHao';
    return () => { document.title = 'NiHao'; };
  }, []);

  const hubSections = [
    { h: 'لماذا الدراسة في الصين؟', p: 'جامعات قوية في الطب والهندسة والتقنية وإدارة الأعمال، تكلفة معقولة مقارنة بكثير من الدول، علاقات اقتصادية متنامية بين العالم العربي والصين، وبيئة دولية. تعلّم الصينية يضيف ميزة مهنية حقيقية لمستقبلك.' },
    { h: 'لمن هذا الدليل؟', p: 'لكل طالب عربي يبحث عن الدراسة في الصين: من الخليج (السعودية، عمان، الإمارات، قطر، الكويت، البحرين)، ومن المغرب العربي (الجزائر، المغرب، تونس، ليبيا، موريتانيا)، ومن مصر والسودان والعراق والأردن وفلسطين واليمن وسوريا ولبنان — وأي ناطق بالعربية.' },
    { h: 'الدراسة بعد الثانوية/البكالوريا', p: 'بعد الثانوية أو البكالوريا تختار التخصص ولغة الدراسة (صينية أو إنجليزية)، توثّق شهاداتك، تقدّم عبر موقع الجامعة، ثم تتقدم للتأشيرة. الإطار العام واحد، والتفاصيل تختلف بين الجامعات.' },
    { h: 'الصيني مقابل الإنجليزي', p: 'البرامج الإنجليزية تبدأ بسرعة دون انتظار اللغة، والبرامج الصينية أرخص وأوسع لكنها تتطلب HSK. الحل الشائع: سنة لغة تحضيرية ثم التخصص.' },
    { h: 'المستندات (نظرة عامة)', p: 'جواز ساري، شهادة الثانوية/البكالوريا وكشف الدرجات (مترجمة وموثقة)، شهادة لغة حسب البرنامج، صور، فحص طبي، وأحياناً خطاب دافع وحسن سيرة. القائمة الدقيقة من موقع الجامعة والسفارة.' },
    { h: 'التكاليف (نظرة عامة)', p: 'رسوم دراسية + سكن + تأمين صحي + معيشة. تختلف كثيراً بين المدن والتخصصات وتتغير سنوياً — لا تعتمد على أرقام قديمة، بل على الأرقام الرسمية للجامعة.' },
    { h: 'المنح (نظرة عامة)', p: 'منح حكومية صينية، ومنح مقاطعات ومدن، ومنح جامعات. كلها تنافسية ولا أحد يضمنها. ابحث في البوابات الرسمية وموقع الجامعة والسفارة، واحذر من يبيع "منحاً مضمونة".' },
    { h: 'تأشيرة الطالب (نظرة عامة)', p: 'X1 للدراسة الطويلة (أكثر من 180 يوماً) وX2 للقصيرة. تحتاج خطاب القبول واستمارة JW201/202 ومستندات أخرى تحددها السفارة الصينية في بلدك.' },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3 font-arabic">
          <GraduationCap className="text-[#FF3333]" /> الدراسة في الصين للطلاب العرب
        </h1>
        <p className="text-sm mb-6 font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          دليل عربي عملي لتعلم الصينية والاستعداد للدراسة في الصين — لكل الطلاب العرب، من الخليج إلى المغرب العربي إلى مصر والعراق وبلاد الشام.
        </p>
      </motion.div>

      <div className="mb-8"><Disclaimer /></div>

      {/* Hub sections */}
      <div className="space-y-5 mb-10">
        {hubSections.map(s => (
          <section key={s.h}>
            <h2 className="font-display font-bold text-xl text-white mb-1.5 font-arabic">{s.h}</h2>
            <p className="text-sm font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{s.p}</p>
          </section>
        ))}
      </div>

      {/* Best cities */}
      <h2 className="font-display font-bold text-2xl text-white mb-4 font-arabic flex items-center gap-2"><MapPin size={20} className="text-[#FF3333]" /> أفضل المدن الطلابية</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {SIC_CITIES.map(c => (
          <div key={c.city} className="liquid-glass p-4 rounded-2xl">
            <p className="font-display font-bold text-white">{c.city}</p>
            <p className="text-[11px] text-[#FF3333] mb-1">{c.province}</p>
            <p className="text-xs font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{c.note}</p>
          </div>
        ))}
      </div>

      {/* Phrases */}
      <div className="mb-10"><PhraseBlock /></div>

      {/* Learn Chinese links */}
      <div className="liquid-glass p-5 rounded-2xl mb-10">
        <h2 className="font-display font-bold text-xl text-white mb-3 font-arabic flex items-center gap-2"><Link2 size={18} className="text-[#FF3333]" /> تعلّم الصينية قبل السفر</h2>
        <div className="flex flex-wrap gap-2">
          {SIC_LEARN_LINKS.map(l => (
            <Link key={l.path} to={l.path} className="btn-secondary text-xs py-2 px-4 font-arabic">{l.label}</Link>
          ))}
        </div>
      </div>

      {/* V2.6: featured keyword guides */}
      <h2 className="font-display font-bold text-2xl text-white mb-4 font-arabic">أدلة مفصّلة جديدة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {seoSprint1All.filter(a => a.slug.includes('study-in-china') || a.slug.includes('scholarship') || a.slug.includes('medical') || a.slug.includes('nursing') || a.slug.includes('visa') || a.slug.includes('costs')).map(a => (
          <Link key={a.slug} to={`/blog/${a.slug}`} className="liquid-glass p-4 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors">
            <span className="text-2xl block mb-1">{a.emoji}</span>
            <p className="text-sm font-bold text-white font-arabic leading-snug">{a.title}</p>
          </Link>
        ))}
      </div>

      {/* Answers + best-site cross-links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <Link to="/answers" className="liquid-glass p-4 rounded-2xl border border-[#FF3333]/20 hover:border-[#FF3333]/50 transition-colors">
          <span className="text-2xl">❓</span>
          <p className="text-sm font-bold text-white font-arabic mt-1">أسئلة وأجوبة سريعة</p>
          <p className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>إجابات مباشرة عن الدراسة في الصين وتعلم الصينية.</p>
        </Link>
        <Link to="/best-chinese-learning-site-arabic" className="liquid-glass p-4 rounded-2xl border border-[#FF3333]/20 hover:border-[#FF3333]/50 transition-colors">
          <span className="text-2xl">🏆</span>
          <p className="text-sm font-bold text-white font-arabic mt-1">كيف تختار موقع تعلم الصينية؟</p>
          <p className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>المعايير المهمة للمبتدئ العربي.</p>
        </Link>
      </div>

      {/* Article groups */}
      {[
        { title: 'أدلة عامة', slugs: sicGeneralSlugs },
        { title: 'أدلة حسب الدولة/المنطقة', slugs: sicRegionalSlugs },
        { title: 'أدلة إضافية', slugs: sicBonusSlugs },
      ].map(group => (
        <div key={group.title} className="mb-8">
          <h2 className="font-display font-bold text-2xl text-white mb-4 font-arabic">{group.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.slugs.map(slug => {
              const a = sicArticleBySlug(slug)!;
              return (
                <Link key={slug} to={`/study-in-china/${slug}`} className="liquid-glass p-4 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors">
                  <span className="text-2xl block mb-2">{a.emoji}</span>
                  <p className="text-sm font-bold text-white font-arabic leading-snug">{a.title}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** V2.4 /study-in-china/:slug — article page */
export function StudyInChinaArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? sicArticleBySlug(slug) : undefined;

  useEffect(() => {
    if (article) document.title = `${article.title} | NiHao`;
    return () => { document.title = 'NiHao'; };
  }, [article]);

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-white mb-4 font-arabic">المقال غير موجود.</p>
        <Link to="/study-in-china" className="btn-primary text-sm font-arabic">الدراسة في الصين</Link>
      </div>
    );
  }

  const related = article.related.map(s => sicArticleBySlug(s)).filter(Boolean) as typeof sicArticles;

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8" dir="rtl">
      <Link to="/study-in-china" className="btn-secondary text-xs py-2 px-4 inline-flex mb-6 font-arabic"><ArrowLeft size={13} /> كل أدلة الدراسة في الصين</Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-5xl block mb-4">{article.emoji}</span>
        <h1 className="font-display font-black text-3xl text-white mb-3 font-arabic leading-snug">{article.title}</h1>
        <p className="text-sm font-arabic mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{article.intro}</p>

        <div className="mb-6"><Disclaimer /></div>

        {article.sections.map(s => (
          <section key={s.h} className="mb-6">
            <h2 className="font-display font-bold text-xl text-white mb-2 font-arabic">{s.h}</h2>
            <p className="text-base font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{s.p}</p>
          </section>
        ))}

        {article.steps && (
          <section className="mb-6">
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><ListChecks size={18} className="text-[#FF3333]" /> خطوات عملية</h2>
            <ol className="space-y-2">
              {article.steps.map((st, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="w-6 h-6 rounded-full bg-[#FF3333]/15 text-[#FF3333] text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  {st}
                </li>
              ))}
            </ol>
          </section>
        )}

        {article.documents && (
          <section className="mb-6">
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><FileText size={18} className="text-[#FF3333]" /> قائمة المستندات</h2>
            <ul className="space-y-1.5">
              {article.documents.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="text-[#10b981] mt-0.5">✓</span> {d}
                </li>
              ))}
            </ul>
          </section>
        )}

        {article.mistakes && (
          <section className="mb-6">
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><XCircle size={18} className="text-[#FF3333]" /> أخطاء شائعة</h2>
            <ul className="space-y-1.5">
              {article.mistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="text-[#FF3333] mt-0.5">✗</span> {m}
                </li>
              ))}
            </ul>
          </section>
        )}

        {article.phrases && (
          <div className="mb-8"><PhraseBlock /></div>
        )}

        {/* Internal learning links */}
        <div className="liquid-glass p-5 rounded-2xl mb-8">
          <p className="text-sm font-display font-bold text-white mb-3 font-arabic flex items-center gap-2"><Link2 size={15} className="text-[#FF3333]" /> تعلّم الصينية على NiHao</p>
          <div className="flex flex-wrap gap-2">
            {SIC_LEARN_LINKS.slice(0, 6).map(l => (
              <Link key={l.path} to={l.path} className="btn-secondary text-xs py-2 px-4 font-arabic">{l.label}</Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <h2 className="font-display font-bold text-xl text-white mb-4 font-arabic flex items-center gap-2"><HelpCircle size={18} className="text-[#FF3333]" /> أسئلة شائعة</h2>
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
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map(r => (
                <Link key={r.slug} to={`/study-in-china/${r.slug}`} className="liquid-glass p-4 rounded-xl hover:border-[#FF3333]/30 border border-transparent transition-colors">
                  <span className="text-2xl block mb-2">{r.emoji}</span>
                  <p className="text-xs font-bold text-white font-arabic leading-snug">{r.title}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="mt-8">
          <Link to="/courses" className="btn-primary text-sm py-3 px-6 inline-flex font-arabic">ابدأ تعلم الصينية الآن <ArrowRight size={15} /></Link>
        </div>
      </motion.article>
    </div>
  );
}
