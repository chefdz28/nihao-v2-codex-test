// V2.4 "Study in China" Arabic SEO hub — original content for ALL Arab students.
// No promises (admission/scholarship/visa), no invented deadlines/fees.
// Every article carries a verify-official-sources disclaimer.

export interface SicSection { h: string; p: string }
export interface SicFAQ { q: string; a: string }
export interface SicPhrase { zh: string; py: string; ar: string }
export interface SicArticle {
  slug: string;            // path segment after /study-in-china/
  title: string;           // SEO title (Arabic)
  meta: string;            // meta description
  emoji: string;
  region?: string;         // for grouping (regional guides)
  intro: string;
  sections: SicSection[];
  steps?: string[];        // practical steps
  documents?: string[];    // documents checklist
  mistakes?: string[];     // common mistakes
  phrases?: boolean;       // show the traveler phrasebook block
  faq: SicFAQ[];
  related: string[];       // other study-in-china slugs
}

// Shared disclaimer shown on the hub and every article.
export const SIC_DISCLAIMER =
  'تنبيه مهم: الشروط والرسوم والمواعيد وقواعد التأشيرة والمستندات تختلف حسب الجامعة والبرنامج والسنة والدولة، وقد تتغير في أي وقت. هذه الصفحة للتعريف العام فقط ولا تُعدّ نصيحة قانونية أو هجرة نهائية. تحقق دائماً من: الموقع الرسمي للجامعة، والسفارة/القنصلية الصينية في بلدك، وبوابات المنح الرسمية، قبل اتخاذ أي قرار أو دفع أي مبلغ.';

// "Chinese phrases every Arab student should learn before traveling"
export const SIC_PHRASES: SicPhrase[] = [
  { zh: '你好', py: 'nǐ hǎo', ar: 'مرحباً' },
  { zh: '谢谢', py: 'xièxie', ar: 'شكراً' },
  { zh: '我是学生', py: 'wǒ shì xuésheng', ar: 'أنا طالب' },
  { zh: '多少钱？', py: 'duōshao qián?', ar: 'كم السعر؟' },
  { zh: '学校在哪儿？', py: 'xuéxiào zài nǎr?', ar: 'أين الجامعة؟' },
  { zh: '我不会说中文', py: 'wǒ bú huì shuō zhōngwén', ar: 'لا أتحدث الصينية' },
  { zh: '请帮我', py: 'qǐng bāng wǒ', ar: 'ساعدني من فضلك' },
  { zh: '厕所在哪儿？', py: 'cèsuǒ zài nǎr?', ar: 'أين دورة المياه؟' },
  { zh: '我要这个', py: 'wǒ yào zhège', ar: 'أريد هذا' },
  { zh: '太贵了', py: 'tài guì le', ar: 'غالٍ جداً' },
];

// Internal NiHao learning links reused across articles.
export const SIC_LEARN_LINKS = [
  { path: '/pinyin', label: 'تعلم البينين (أساس القراءة)' },
  { path: '/tones', label: 'مدرب النغمات (النطق)' },
  { path: '/numbers', label: 'الأرقام والأسعار والتواريخ' },
  { path: '/essentials', label: 'الأساسيات: الأيام والشهور والعبارات' },
  { path: '/dialogues', label: 'حوارات حياة الطالب والسفر' },
  { path: '/dictionary', label: 'قاموس الكلمات المفيدة' },
  { path: '/courses', label: 'ابدأ دروس الصينية HSK1' },
  { path: '/stories', label: 'قصص قصيرة للقراءة' },
];

// Provinces / cities reference (general info, no fees).
export interface CityInfo { city: string; province: string; note: string }
export const SIC_CITIES: CityInfo[] = [
  { city: 'بكين (Beijing)', province: 'بلدية بكين', note: 'العاصمة ومركز كبرى الجامعات مثل تسينغهوا وبكين؛ بيئة أكاديمية قوية وتكلفة معيشة أعلى.' },
  { city: 'شنغهاي (Shanghai)', province: 'بلدية شنغهاي', note: 'مدينة عالمية واقتصادية؛ جامعات مرموقة وكثير من البرامج بالإنجليزية، ومعيشة مرتفعة.' },
  { city: 'نانجينغ (Nanjing)', province: 'جيانغسو (Jiangsu)', note: 'مدينة جامعية عريقة بتكلفة أقل من بكين وشنغهاي، وأجواء طلابية هادئة.' },
  { city: 'هانغجو (Hangzhou)', province: 'تشجيانغ (Zhejiang)', note: 'مدينة جميلة ومركز تقني (موطن علي بابا)؛ جامعة تشجيانغ من الكبرى.' },
  { city: 'ووهان (Wuhan)', province: 'هوبي (Hubei)', note: 'من أكبر المدن الطلابية في الصين بعدد ضخم من الجامعات وتكلفة معتدلة.' },
  { city: 'شيان (Xi’an)', province: 'شنشي (Shaanxi)', note: 'مدينة تاريخية بتكلفة منخفضة نسبياً وجامعات هندسية وطبية قوية.' },
  { city: 'قوانغجو (Guangzhou)', province: 'قوانغدونغ (Guangdong)', note: 'مدينة تجارية جنوبية فيها جالية عربية وأفريقية كبيرة وطقس دافئ.' },
  { city: 'تشنغدو (Chengdu)', province: 'سيتشوان (Sichuan)', note: 'معيشة منخفضة وأجواء مريحة وطعام مشهور؛ خيار اقتصادي جيد.' },
];
