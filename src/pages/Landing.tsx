import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Star, Users, BookOpen, Mic } from 'lucide-react';
import JsonLd from '@/components/JsonLd';
import { trackEvent } from '@/lib/analytics';

// V3.18 — distraction-free ad landing page (/start). One goal: sign-up.
// Renders without the global header/footer (see Layout BARE_ROUTES). Preserves
// ?ref= and ?utm_* params so referral + ad attribution flow into /register.
export default function Landing() {
  const [params] = useSearchParams();

  useEffect(() => {
    trackEvent('landing_view', {
      utm_source: params.get('utm_source') || '',
      utm_campaign: params.get('utm_campaign') || '',
    });
  }, [params]);

  // build a register link that carries ref + utm through
  const qs = new URLSearchParams();
  const ref = params.get('ref'); if (ref) qs.set('ref', ref);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => {
    const v = params.get(k); if (v) qs.set(k, v);
  });
  const registerHref = `/register${qs.toString() ? `?${qs.toString()}` : ''}`;

  const onCta = (where: string) => trackEvent('landing_cta_click', { where });

  const benefits = [
    { icon: BookOpen, title: 'من الصفر إلى HSK', desc: 'دروس متدرّجة بالعربية، من أول حرف حتى اجتياز اختبار HSK' },
    { icon: Mic, title: 'تدريب النطق بالذكاء الاصطناعي', desc: 'انطق الجمل الصينية واحصل على تقييم فوري لنطقك' },
    { icon: Star, title: 'ألعاب ومكافآت', desc: 'تعلّم بالبطاقات والتحديات، واكسب نقاطاً وشارات' },
    { icon: Users, title: 'ادعُ أصدقاءك', desc: 'تعلّموا معاً واحصلوا على مكافآت عند كل دعوة' },
  ];

  return (
    <div dir="rtl" className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
      <JsonLd id="landing-course" data={{
        '@context': 'https://schema.org', '@type': 'Course',
        name: 'تعلّم اللغة الصينية من الصفر — NiHao',
        description: 'منصة عربية لتعلّم الصينية: دروس، نطق بالذكاء الاصطناعي، اختبارات HSK، وألعاب.',
        provider: { '@type': 'Organization', name: 'NiHao', sameAs: 'https://cnihao.com' },
      }} />

      {/* subtle brand glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,51,51,0.12), transparent 70%)' }} />

      {/* minimal logo bar (no nav) */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-white text-2xl">NiHao</span>
          <span className="text-[#FF3333] font-chinese text-xl">你好</span>
        </div>
        <Link to={registerHref} onClick={() => onCta('top')}
          className="text-sm font-arabic text-white/80 hover:text-white transition-colors">
          تسجيل الدخول
        </Link>
      </div>

      {/* hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-16 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-1.5 bg-[#FF3333]/15 text-[#FF6666] rounded-full px-3 py-1 text-xs font-arabic mb-5">
            🎉 مجاني تماماً · بالعربية
          </div>
          <h1 className="font-display font-black text-white mb-4 font-arabic leading-tight" style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}>
            تعلّم اللغة الصينية<br />من الصفر
          </h1>
          <p className="font-arabic text-lg mb-8 max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
            منصة عربية متكاملة: دروس متدرّجة، تقييم نطق بالذكاء الاصطناعي، اختبارات HSK، وألعاب ممتعة — كل ما تحتاجه لإتقان الصينية.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to={registerHref} onClick={() => onCta('hero')}
              className="btn-primary inline-flex items-center gap-2 py-4 px-8 text-lg font-arabic font-bold">
              ابدأ الآن مجاناً <ArrowLeft size={20} />
            </Link>
            <span className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>
              لا يتطلّب بطاقة · تسجيل بدقيقة
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7 }}
          className="hidden lg:block">
          <img src="/images/hero-main.webp" alt="تعلّم الصينية مع NiHao" loading="eager" width={520} height={520}
            className="w-full max-w-[480px] mx-auto object-contain"
            style={{ filter: 'drop-shadow(0 24px 70px rgba(255,51,51,0.28))' }} />
        </motion.div>
      </div>

      {/* benefits */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="liquid-glass rounded-2xl p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF3333]/15 flex items-center justify-center shrink-0">
                <b.icon size={20} className="text-[#FF3333]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white mb-1 font-arabic">{b.title}</h3>
                <p className="text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* trust row */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#10b981]" /> 45+ درساً بالعربية</span>
          <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#10b981]" /> اختبارات HSK1-3</span>
          <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#10b981]" /> قاموس وبينين</span>
          <span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#10b981]" /> معلّم ذكي</span>
        </div>
      </div>

      {/* final CTA */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pb-20 text-center">
        <div className="liquid-glass-strong rounded-3xl p-8">
          <h2 className="font-display font-black text-white mb-3 font-arabic" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
            رحلتك للصينية تبدأ الآن
          </h2>
          <p className="font-arabic mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            انضمّ مجاناً وابدأ أول درس اليوم.
          </p>
          <Link to={registerHref} onClick={() => onCta('final')}
            className="btn-primary inline-flex items-center gap-2 py-4 px-8 text-lg font-arabic font-bold">
            سجّل مجاناً <ArrowLeft size={20} />
          </Link>
        </div>
        <p className="text-xs font-arabic mt-8" style={{ color: 'var(--color-text-tertiary)' }}>
          © NiHao · منصة تعلّم اللغة الصينية بالعربية
        </p>
      </div>
    </div>
  );
}
