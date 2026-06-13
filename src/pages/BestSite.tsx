import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Check, ArrowRight, Link2 } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { faqLd, breadcrumbLd, articleLd } from '@/lib/structuredData';

const CRITERIA = [
  { icon: '🗣️', h: 'شرح بالعربية', p: 'المبتدئ العربي يتعلم أسرع حين تُشرح المفاهيم بلغته بدل لغة وسيطة.', link: { path: '/courses', label: 'دروس NiHao بالعربية' } },
  { icon: '🔤', h: 'إظهار البينين', p: 'البينين فوق كل جملة صينية ضروري لقراءة المبتدئ ونطقه الصحيح.', link: { path: '/pinyin', label: 'درس البينين' } },
  { icon: '🎵', h: 'تدريب النغمات', p: 'النغمات أصعب ما يواجه العربي، فوجود مدرّب صوتي للنغمات أساسي.', link: { path: '/tones', label: 'مدرب النغمات' } },
  { icon: '📚', h: 'دروس متدرجة للمبتدئ', p: 'منهج HSK1 منظم يبني المهارة خطوة بخطوة دون قفز.', link: { path: '/courses', label: 'دروس HSK1' } },
  { icon: '⏰', h: 'ممارسة يومية', p: 'مهام يومية وبطاقات مراجعة تحافظ على الاستمرارية وهي سر التقدم.', link: { path: '/courses', label: 'ابدأ الممارسة' } },
  { icon: '📖', h: 'قاموس وقصص', p: 'قاموس للكلمات وقصص قصيرة للقراءة المتدرجة يثبّتان المفردات.', link: { path: '/dictionary', label: 'القاموس' } },
  { icon: '🇨🇳', h: 'الاستعداد للدراسة في الصين', p: 'دليل عربي للقبول والتكاليف والتأشيرة وتعلم الصينية قبل السفر.', link: { path: '/study-in-china', label: 'الدراسة في الصين' } },
];

const FAQ = [
  { q: 'ما المقصود بـ"أفضل موقع"؟', a: 'لا يوجد أفضل مطلق للجميع؛ الأفضل لك هو الذي يحقق المعايير المهمة لمستواك وهدفك: العربية، البينين، النغمات، الدروس المتدرجة، والممارسة اليومية.' },
  { q: 'هل NiHao يحقق هذه المعايير؟', a: 'نعم، NiHao منصة عملية موجهة للناطقين بالعربية تجمع الشرح العربي والبينين والنغمات والدروس والقاموس والقصص وقسم الدراسة في الصين في مكان واحد.' },
  { q: 'هل NiHao مجاني؟', a: 'الأدوات الأساسية متاحة للاستخدام بدون مقابل.' },
];

/** V2.5 /best-chinese-learning-site-arabic — criteria-based "best site" landing (honest) */
export default function BestSite() {
  useEffect(() => {
    document.title = 'أفضل موقع عربي لتعلم الصينية من الصفر: كيف تختار المنصة المناسبة؟ | NiHao';
    return () => { document.title = 'NiHao'; };
  }, []);

  return (
    <div className="max-w-[820px] mx-auto px-6 py-8" dir="rtl">
      <JsonLd id="best-breadcrumb" data={breadcrumbLd([
        { name: 'الرئيسية', path: '/' },
        { name: 'أفضل موقع لتعلم الصينية', path: '/best-chinese-learning-site-arabic' },
      ])} />
      <JsonLd id="best-faq" data={faqLd(FAQ)} />
      <JsonLd id="best-article" data={articleLd({
        headline: 'أفضل موقع عربي لتعلم الصينية من الصفر: كيف تختار المنصة المناسبة؟',
        description: 'معايير اختيار موقع تعلم الصينية للمبتدئ العربي، وكيف يغطيها NiHao.',
        path: '/best-chinese-learning-site-arabic', dateModified: '2026-06-12',
      })} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-3xl text-white mb-3 flex items-center gap-3 font-arabic leading-snug">
          <Trophy className="text-[#FF3333] shrink-0" /> أفضل موقع عربي لتعلم الصينية من الصفر: كيف تختار المنصة المناسبة؟
        </h1>
        <p className="text-sm mb-6 font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          لا يوجد موقع واحد "هو الأفضل رسمياً" لكل الناس. الأفضل لك هو الذي يحقق المعايير التي يحتاجها المبتدئ العربي فعلاً. إليك هذه المعايير، وكيف يغطيها NiHao بصدق ودون مبالغة.
        </p>
      </motion.div>

      <div className="space-y-3 mb-8">
        {CRITERIA.map((c, i) => (
          <motion.div key={c.h} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
            className="liquid-glass p-5 rounded-2xl flex items-start gap-4">
            <span className="text-3xl shrink-0">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-white font-arabic mb-1 flex items-center gap-2"><Check size={16} className="text-[#10b981]" /> {c.h}</h2>
              <p className="text-sm font-arabic leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>{c.p}</p>
              <Link to={c.link.path} className="text-xs text-[#FF3333] font-arabic inline-flex items-center gap-1">{c.link.label} <ArrowRight size={12} /></Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="liquid-glass p-6 rounded-2xl mb-8 border border-[#FF3333]/20">
        <h2 className="font-display font-bold text-xl text-white mb-2 font-arabic">أين يقف NiHao؟</h2>
        <p className="text-sm font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          NiHao منصة عملية موجّهة للناطقين بالعربية ومناسبة للطلاب العرب الراغبين في تعلم الصينية والاستعداد للدراسة في الصين. لا نقول إنه "الأفضل رسمياً"، لكنه يغطي المعايير أعلاه في مكان واحد ومجاناً في أدواته الأساسية. جرّبه وقارنه بنفسك.
        </p>
      </div>

      {/* Quick links */}
      <div className="liquid-glass p-5 rounded-2xl mb-8">
        <p className="text-sm font-display font-bold text-white mb-3 font-arabic flex items-center gap-2"><Link2 size={15} className="text-[#FF3333]" /> ابدأ من هنا</p>
        <div className="flex flex-wrap gap-2">
          {[['/pinyin', 'البينين'], ['/tones', 'النغمات'], ['/courses', 'الدروس'], ['/dictionary', 'القاموس'], ['/stories', 'القصص'], ['/study-in-china', 'الدراسة في الصين']].map(([p, l]) => (
            <Link key={p} to={p} className="btn-secondary text-xs py-2 px-4 font-arabic">{l}</Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <h2 className="font-display font-bold text-xl text-white mb-4 font-arabic">أسئلة شائعة</h2>
      <div className="space-y-3 mb-8">
        {FAQ.map(f => (
          <div key={f.q} className="liquid-glass p-4 rounded-xl">
            <p className="text-sm font-bold text-white font-arabic mb-1">{f.q}</p>
            <p className="text-sm font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{f.a}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] font-arabic mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
        محتوى تعليمي من NiHao — ليس تقييماً رسمياً أو إعلاناً. آخر تحديث: 2026-06-12
      </p>
      <Link to="/courses" className="btn-primary text-sm py-3 px-6 inline-flex font-arabic">ابدأ الآن <ArrowRight size={15} /></Link>
    </div>
  );
}
