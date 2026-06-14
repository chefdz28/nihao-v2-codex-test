// V2.8A — initial HSK2 batch. Kept intentionally small, clean and verified to
// avoid overloading the release. Each entry: chinese, pinyin (with tones),
// arabic, english, and a short example (zh + pinyin + arabic). No duplicates of
// HSK1 words (deduped at build time anyway). Expand in later releases.
import type { DictExample } from '@/data/dictionaryCore';

export interface Hsk2Word {
  chinese: string;
  pinyin: string;
  arabic: string;
  english: string;
  examples: DictExample[];
}

export const hsk2Batch: Hsk2Word[] = [
  { chinese: '知道', pinyin: 'zhīdào', arabic: 'يعرف', english: 'to know',
    examples: [{ zh: '我知道', py: 'wǒ zhīdào', ar: 'أنا أعرف' }] },
  { chinese: '觉得', pinyin: 'juéde', arabic: 'يشعر / يعتقد', english: 'to feel / think',
    examples: [{ zh: '我觉得很好', py: 'wǒ juéde hěn hǎo', ar: 'أشعر أنه جيد جداً' }] },
  { chinese: '时间', pinyin: 'shíjiān', arabic: 'وقت', english: 'time',
    examples: [{ zh: '没有时间', py: 'méiyǒu shíjiān', ar: 'لا يوجد وقت' }] },
  { chinese: '问题', pinyin: 'wèntí', arabic: 'سؤال / مشكلة', english: 'question / problem',
    examples: [{ zh: '我有问题', py: 'wǒ yǒu wèntí', ar: 'عندي سؤال' }] },
  { chinese: '因为', pinyin: 'yīnwèi', arabic: 'لأن', english: 'because',
    examples: [{ zh: '因为忙', py: 'yīnwèi máng', ar: 'لأنني مشغول' }] },
  { chinese: '所以', pinyin: 'suǒyǐ', arabic: 'لذلك', english: 'so / therefore',
    examples: [{ zh: '所以我来了', py: 'suǒyǐ wǒ lái le', ar: 'لذلك أتيت' }] },
  { chinese: '可以', pinyin: 'kěyǐ', arabic: 'يمكن / مسموح', english: 'can / may',
    examples: [{ zh: '可以吗？', py: 'kěyǐ ma?', ar: 'هل يمكن؟' }] },
  { chinese: '帮助', pinyin: 'bāngzhù', arabic: 'يساعد / مساعدة', english: 'to help / help',
    examples: [{ zh: '请帮助我', py: 'qǐng bāngzhù wǒ', ar: 'ساعدني من فضلك' }] },
  { chinese: '希望', pinyin: 'xīwàng', arabic: 'يأمل / أمل', english: 'to hope / hope',
    examples: [{ zh: '我希望', py: 'wǒ xīwàng', ar: 'آمل' }] },
  { chinese: '事情', pinyin: 'shìqing', arabic: 'أمر / شأن', english: 'matter / affair',
    examples: [{ zh: '很多事情', py: 'hěn duō shìqing', ar: 'أمور كثيرة' }] },
  { chinese: '开始', pinyin: 'kāishǐ', arabic: 'يبدأ / بداية', english: 'to begin / start',
    examples: [{ zh: '开始上课', py: 'kāishǐ shàngkè', ar: 'تبدأ المحاضرة' }] },
  { chinese: '介绍', pinyin: 'jièshào', arabic: 'يقدّم / يعرّف', english: 'to introduce',
    examples: [{ zh: '介绍一下', py: 'jièshào yíxià', ar: 'عرّف عن نفسك' }] },
  { chinese: '完成', pinyin: 'wánchéng', arabic: 'يُكمل / يُنجز', english: 'to complete',
    examples: [{ zh: '完成作业', py: 'wánchéng zuòyè', ar: 'يُنجز الواجب' }] },
  { chinese: '准备', pinyin: 'zhǔnbèi', arabic: 'يُجهّز / يستعد', english: 'to prepare',
    examples: [{ zh: '准备考试', py: 'zhǔnbèi kǎoshì', ar: 'يستعد للاختبار' }] },
  { chinese: '考试', pinyin: 'kǎoshì', arabic: 'اختبار', english: 'exam',
    examples: [{ zh: '明天考试', py: 'míngtiān kǎoshì', ar: 'الاختبار غداً' }] },
  { chinese: '旅游', pinyin: 'lǚyóu', arabic: 'يسافر / سياحة', english: 'to travel',
    examples: [{ zh: '去中国旅游', py: 'qù zhōngguó lǚyóu', ar: 'السفر إلى الصين' }] },
  { chinese: '机场', pinyin: 'jīchǎng', arabic: 'مطار', english: 'airport',
    examples: [{ zh: '机场在哪儿？', py: 'jīchǎng zài nǎr?', ar: 'أين المطار؟' }] },
  { chinese: '宾馆', pinyin: 'bīnguǎn', arabic: 'فندق', english: 'hotel',
    examples: [{ zh: '住宾馆', py: 'zhù bīnguǎn', ar: 'يُقيم في فندق' }] },
  { chinese: '一起', pinyin: 'yìqǐ', arabic: 'معاً', english: 'together',
    examples: [{ zh: '一起去', py: 'yìqǐ qù', ar: 'نذهب معاً' }] },
  { chinese: '已经', pinyin: 'yǐjīng', arabic: 'بالفعل / قد', english: 'already',
    examples: [{ zh: '已经到了', py: 'yǐjīng dào le', ar: 'وصلت بالفعل' }] },
];
