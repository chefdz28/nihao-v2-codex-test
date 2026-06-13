// V2.1 learning stages — visual grouping of the existing 45 lessons into a
// clear journey. Mapping is by lesson order_num only: lesson IDs and routes
// are untouched. Level 0 is tools-based (Pinyin & Tones), not lesson-based.

export interface Stage {
  id: string;
  emoji: string;
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
  /** inclusive lesson order range; null = tools stage */
  range: [number, number] | null;
  /** tool links for non-lesson stages */
  tools?: { path: string; labelKey: string }[];
}

export const STAGES: Stage[] = [
  {
    id: 'stage0', emoji: '🔤',
    title_en: 'Pinyin & Tones', title_ar: 'البينين والنغمات',
    desc_en: 'Read Chinese sounds before anything else — letters and the 4 tones.',
    desc_ar: 'اقرأ أصوات الصينية قبل أي شيء — الحروف والنغمات الأربع.',
    range: null,
    tools: [
      { path: '/pinyin', labelKey: 'nav.pinyin' },
      { path: '/tones', labelKey: 'nav.tones' },
      { path: '/essentials', labelKey: 'nav.essentials' },
    ],
  },
  {
    id: 'stage1', emoji: '🎓',
    title_en: 'HSK1 Basics', title_ar: 'أساسيات HSK1',
    desc_en: 'Greetings, names, identity, simple questions — your first real Chinese.',
    desc_ar: 'التحيات والأسماء والهوية والأسئلة البسيطة — أول صينية حقيقية لك.',
    range: [1, 9],
  },
  {
    id: 'stage2', emoji: '🏠',
    title_en: 'Daily Life Chinese', title_ar: 'الحياة اليومية',
    desc_en: 'Time, dates, weather, food and everyday routines.',
    desc_ar: 'الوقت والتواريخ والطقس والطعام وروتين الحياة اليومية.',
    range: [10, 18],
  },
  {
    id: 'stage3', emoji: '✈️',
    title_en: 'Travel & Shopping', title_ar: 'السفر والتسوق',
    desc_en: 'Prices, transport, directions and getting around China.',
    desc_ar: 'الأسعار والمواصلات والاتجاهات والتنقل في الصين.',
    range: [19, 27],
  },
  {
    id: 'stage4', emoji: '📐',
    title_en: 'Grammar Builder', title_ar: 'بناء القواعد',
    desc_en: 'Strengthen sentence patterns and build longer, correct sentences.',
    desc_ar: 'تقوية أنماط الجمل وبناء جمل أطول وأصح.',
    range: [28, 36],
  },
  {
    id: 'stage5', emoji: '🗣️',
    title_en: 'Speaking & Listening', title_ar: 'المحادثة والاستماع',
    desc_en: 'Put it all together: conversations, listening and confidence.',
    desc_ar: 'اجمع كل ما تعلمته: محادثات واستماع وثقة.',
    range: [37, 45],
  },
];

export function stageOfLesson(orderNum: number): Stage | undefined {
  return STAGES.find(s => s.range && orderNum >= s.range[0] && orderNum <= s.range[1]);
}

export function lessonsInStage<T extends { order_num: number }>(stage: Stage, lessons: T[]): T[] {
  if (!stage.range) return [];
  return lessons.filter(l => l.order_num >= stage.range![0] && l.order_num <= stage.range![1]);
}
