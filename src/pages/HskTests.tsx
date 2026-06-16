import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, ListChecks, BarChart3, ArrowLeft } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import Seo from '@/components/Seo';

const TESTS = [
  {
    level: 1, path: '/hsk1-simulation', questions: 40, minutes: 25,
    difficulty: 'مبتدئ', diffCls: 'text-[#10b981] bg-[#10b981]/10',
    desc: 'الكلمات والجمل الأساسية: التحية، الأرقام، العائلة، الوقت. مناسب لمن أنهى أساسيات اللغة.',
  },
  {
    level: 2, path: '/hsk2-simulation', questions: 36, minutes: 20,
    difficulty: 'متوسط', diffCls: 'text-[#3b82f6] bg-[#3b82f6]/10',
    desc: 'جمل أطول ومفردات الحياة اليومية: التسوّق، الطقس، الهوايات، الصحة. لمن أتقن HSK1.',
  },
  {
    level: 3, path: '/hsk3-simulation', questions: 40, minutes: 25,
    difficulty: 'متوسط متقدّم', diffCls: 'text-[#f59e0b] bg-[#f59e0b]/10',
    desc: 'تراكيب أعقد ومفردات أوسع: الدراسة، العمل، الآراء، المقارنات. لمن أتقن HSK2.',
  },
];

/** V3.3 /hsk-tests — unified hub for all HSK practice simulations. */
export default function HskTests() {
  useEffect(() => { trackEvent('hsk_tests_page_view', {}); }, []);

  return (
    <div className="max-w-[820px] mx-auto px-6 py-10">
      <Seo />
      <div className="text-center mb-8" dir="rtl">
        <ClipboardList size={40} className="text-[#FF3333] mx-auto mb-3" />
        <h1 className="font-display font-black text-3xl text-white mb-2">اختبارات HSK التجريبية</h1>
        <p className="text-sm font-arabic max-w-[560px] mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          محاكاة تدريبية لمستويات HSK — استماع وقراءة، بمؤقّت ونتيجة فورية ومراجعة للأخطاء.
          هذه تمارين تدريبية لقياس مستواك، وليست اختبارات HSK الرسمية.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4" dir="rtl">
        {TESTS.map((tst, i) => (
          <motion.div
            key={tst.level}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="liquid-glass rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-black text-2xl text-white">HSK{tst.level}</span>
              <span className={`text-[11px] font-arabic px-2 py-0.5 rounded-full ${tst.diffCls}`}>{tst.difficulty}</span>
            </div>
            <p className="text-xs font-arabic mb-4 flex-1" style={{ color: 'var(--color-text-secondary)' }}>{tst.desc}</p>
            <div className="flex items-center gap-3 text-[11px] font-arabic mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
              <span className="flex items-center gap-1"><ListChecks size={12} /> {tst.questions} سؤال</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {tst.minutes} دقيقة</span>
            </div>
            <Link
              to={tst.path}
              onClick={() => trackEvent('hsk_test_card_click', { hsk_level: tst.level })}
              className="btn-primary text-sm py-2.5 text-center font-arabic"
            >
              ابدأ الاختبار
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-arabic" dir="rtl">
        <Link to="/flashcards/hsk3" className="liquid-glass rounded-xl px-4 py-2 text-white hover:border-[#FF3333]/30 border border-transparent transition-colors flex items-center gap-1.5">
          <BarChart3 size={13} className="text-[#FF3333]" /> بطاقات HSK3
        </Link>
        <Link to="/dictionary" className="liquid-glass rounded-xl px-4 py-2 text-white hover:border-[#FF3333]/30 border border-transparent transition-colors">القاموس</Link>
        <Link to="/practice" className="text-[#a0a0a0] hover:text-white flex items-center gap-1"><ArrowLeft size={13} /> كل التمارين</Link>
      </div>
    </div>
  );
}
