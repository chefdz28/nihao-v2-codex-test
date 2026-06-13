import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n';
import JsonLd from '@/components/JsonLd';
import { orgLd, websiteLd } from '@/lib/structuredData';

const DOMAIN = 'https://cnihao.com';

interface SeoMeta { title_ar: string; title_en: string; desc_ar: string; desc_en: string }

// Static per-route metadata (Arabic + English). Dynamic routes (story/article)
// set their own document.title in their page components; this covers the rest.
const META: Record<string, SeoMeta> = {
  '/': {
    title_ar: 'NiHao — تعلم الصينية من الصفر بالعربية والإنجليزية',
    title_en: 'NiHao — Learn Chinese from Zero (Arabic & English)',
    desc_ar: 'منصة تعليم الصينية للمبتدئين مع البينين، النغمات، الحروف، القصص، القاموس، التمارين والشهادات.',
    desc_en: 'Beginner Chinese platform: Pinyin, tones, characters, stories, dictionary, exercises and certificates.',
  },
  '/courses': {
    title_ar: 'دورة HSK1 — 45 درساً لتعلم الصينية للمبتدئين',
    title_en: 'HSK1 Course — 45 Beginner Chinese Lessons',
    desc_ar: 'تعلم الصينية خطوة بخطوة عبر 45 درساً منظماً مع البينين والصوت والاختبارات.',
    desc_en: 'Learn Chinese step by step across 45 structured lessons with Pinyin, audio and quizzes.',
  },
  '/pinyin': {
    title_ar: 'تعلم البينين Pinyin للمبتدئين',
    title_en: 'Learn Pinyin for Beginners',
    desc_ar: 'شرح البينين والنغمات الصينية مع أمثلة وتمارين صوتية.',
    desc_en: 'Pinyin and Chinese tones explained with examples and audio exercises.',
  },
  '/essentials': {
    title_ar: 'أساسيات الصينية — الأرقام والأيام والتواريخ',
    title_en: 'Chinese Essentials — Numbers, Days, Dates',
    desc_ar: 'تعلم الأرقام والأيام والشهور والتواريخ والأعمار والأسعار بالصينية.',
    desc_en: 'Learn Chinese numbers, days, months, dates, ages and prices.',
  },
  '/tones': {
    title_ar: 'مدرب النغمات الصينية',
    title_en: 'Chinese Tone Trainer',
    desc_ar: 'تدرب على النغمات الأربع بالاستماع والاختيار — أهم مهارة للناطقين بالعربية.',
    desc_en: 'Practice the four Chinese tones by listening — the key skill for Arabic speakers.',
  },
  '/numbers': {
    title_ar: 'تعلم الأرقام بالصينية من 1 إلى 100',
    title_en: 'Learn Chinese Numbers 1–100',
    desc_ar: 'تعلم الأرقام الصينية مع البينين والصوت والتمارين.',
    desc_en: 'Learn Chinese numbers with Pinyin, audio and exercises.',
  },
  '/dialogues': {
    title_ar: 'حوارات صينية تفاعلية للمبتدئين',
    title_en: 'Interactive Chinese Dialogues',
    desc_ar: 'تدرب على محادثات واقعية: المطعم، التاكسي، التسوق — مع الصوت والبينين.',
    desc_en: 'Practice real conversations: restaurant, taxi, shopping — with audio and Pinyin.',
  },
  '/path': {
    title_ar: 'خريطة تعلم الصينية',
    title_en: 'Chinese Learning Path',
    desc_ar: 'تابع رحلتك في تعلم الصينية درساً بدرس عبر المستويات.',
    desc_en: 'Follow your Chinese learning journey lesson by lesson through the levels.',
  },
  '/dictionary': {
    title_ar: 'قاموس صيني عربي للمبتدئين',
    title_en: 'Beginner Chinese–Arabic Dictionary',
    desc_ar: 'ابحث في كلمات HSK1 بالصيني والبينين والعربي والإنجليزي مع كلمة اليوم.',
    desc_en: 'Search HSK1 words by Chinese, Pinyin, Arabic and English, with a word of the day.',
  },
  '/stories': {
    title_ar: 'قصص صينية قصيرة للمبتدئين',
    title_en: 'Short Chinese Stories for Beginners',
    desc_ar: 'قصص بسيطة بالصينية مع البينين والترجمة العربية والإنجليزية والصوت والاختبارات.',
    desc_en: 'Simple Chinese stories with Pinyin, Arabic and English translation, audio and quizzes.',
  },
  '/certificates': {
    title_ar: 'شهادات إتمام مستويات الصينية',
    title_en: 'Chinese Level Certificates',
    desc_ar: 'اجتز الاختبار النهائي لكل مستوى واحصل على شهادة إتمام قابلة للطباعة.',
    desc_en: 'Pass each level final test and earn a printable completion certificate.',
  },
  '/worksheets': {
    title_ar: 'أوراق عمل صينية للطباعة',
    title_en: 'Printable Chinese Worksheets',
    desc_ar: 'أوراق تدريب قابلة للطباعة لكل درس مع مفتاح الإجابات.',
    desc_en: 'Printable practice worksheets for every lesson, with an answer key.',
  },
  '/blog': {
    title_ar: 'مدونة تعلم الصينية بالعربية',
    title_en: 'Learn Chinese Blog (Arabic)',
    desc_ar: 'مقالات عربية أصلية: كيف تتعلم الصينية، البينين، النغمات، HSK1 وأكثر.',
    desc_en: 'Original Arabic articles: how to learn Chinese, Pinyin, tones, HSK1 and more.',
  },
  '/missions': { title_ar: 'المهام اليومية', title_en: 'Daily Missions', desc_ar: 'أكمل المهام اليومية واكسب نقاط الخبرة.', desc_en: 'Complete daily missions and earn XP.' },
  '/achievements': { title_ar: 'الإنجازات والشارات', title_en: 'Achievements & Badges', desc_ar: 'افتح الشارات كلما تقدمت في تعلم الصينية.', desc_en: 'Unlock badges as you progress in Chinese.' },
  '/placement-test': { title_ar: 'اختبار تحديد المستوى', title_en: 'Placement Test', desc_ar: 'اختبار قصير يحدد أفضل نقطة بداية لك.', desc_en: 'A short test to find your best starting point.' },
  '/mistakes': { title_ar: 'دفتر الأخطاء', title_en: 'Mistake Notebook', desc_ar: 'راجع إجاباتك الخاطئة وحوّلها إلى نقاط قوة.', desc_en: 'Review your wrong answers and turn them into strengths.' },
  '/teacher': { title_ar: 'حزمة المعلم للطباعة', title_en: 'Teacher Lesson Pack', desc_ar: 'اطبع حزمة درس كاملة للفصل الدراسي.', desc_en: 'Print a full classroom lesson pack.' },
  '/dictation': { title_ar: 'الإملاء الصيني 听写', title_en: 'Chinese Dictation 听写', desc_ar: 'استمع واكتب ثم اكشف الإجابة.', desc_en: 'Listen, write, then reveal the answer.' },
  '/hsk1-simulation': { title_ar: 'محاكاة تدريبية لاختبار HSK1', title_en: 'HSK1 Practice Simulation', desc_ar: 'محاكاة تدريبية بـ40 سؤالاً — ليست اختباراً رسمياً.', desc_en: 'A 40-question practice simulation — not an official exam.' },
  '/report': { title_ar: 'تقرير تقدم الطالب', title_en: 'Student Progress Report', desc_ar: 'تقرير قابل للطباعة بتقدمك ونقاط ضعفك وخطواتك التالية.', desc_en: 'A printable report of your progress, weak areas and next steps.' },
  '/answers': {
    title_ar: 'أسئلة وأجوبة عن تعلم الصينية والدراسة في الصين',
    title_en: 'Q&A: Learning Chinese & Studying in China',
    desc_ar: 'إجابات مباشرة لأكثر أسئلة المبتدئين العرب عن تعلم الصينية والبينين والنغمات والدراسة في الصين.',
    desc_en: 'Direct answers to common Arab-beginner questions about learning Chinese, Pinyin, tones and studying in China.',
  },
  '/best-chinese-learning-site-arabic': {
    title_ar: 'أفضل موقع عربي لتعلم الصينية من الصفر: كيف تختار المنصة المناسبة؟',
    title_en: 'Best Arabic Site to Learn Chinese: How to Choose',
    desc_ar: 'معايير اختيار موقع تعلم الصينية للمبتدئ العربي، وكيف يغطيها NiHao بصدق ودون مبالغة.',
    desc_en: 'Criteria for choosing a Chinese-learning site for Arab beginners, and how NiHao fits them honestly.',
  },
  '/study-in-china': {
    title_ar: 'الدراسة في الصين للطلاب العرب — دليل شامل',
    title_en: 'Study in China for Arab Students — Full Guide',
    desc_ar: 'دليل عربي للدراسة في الصين: القبول، التكاليف، المنح، التأشيرة، أفضل المدن، والجامعات — وتعلّم الصينية قبل السفر.',
    desc_en: 'Arabic guide to studying in China: admission, costs, scholarships, visa, best cities and universities — plus learning Chinese before you travel.',
  },
  '/practice': { title_ar: 'مركز أدوات التعلم', title_en: 'Learning Tools Hub', desc_ar: 'كل أدوات تعلم الصينية في مكان واحد.', desc_en: 'All your Chinese learning tools in one place.' },
};

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * V2.3 Seo — route-based <title>/description/OG/canonical updater for this Vite
 * SPA (no react-helmet). Dynamic pages (story/article) set their own title and
 * are skipped here so we don't overwrite them.
 */
export default function Seo() {
  const location = useLocation();
  const { lang } = useI18n();

  useEffect(() => {
    const path = location.pathname;
    // dynamic detail pages manage their own title
    const isDynamic = /^\/(stories|blog|courses|present|worksheet|quiz)\/.+/.test(path);
    const canonical = `${DOMAIN}${path === '/' ? '/' : path.replace(/\/$/, '')}`;
    upsertCanonical(canonical);

    if (isDynamic) return;

    const meta = META[path];
    if (!meta) return;
    const isAr = lang === 'ar';
    const title = isAr ? meta.title_ar : meta.title_en;
    const desc = isAr ? meta.desc_ar : meta.desc_en;
    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', desc);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    document.documentElement.lang = isAr ? 'ar' : 'en';
  }, [location.pathname, lang]);

  return (
    <>
      <JsonLd id="org" data={orgLd} />
      <JsonLd id="website" data={websiteLd} />
    </>
  );
}
