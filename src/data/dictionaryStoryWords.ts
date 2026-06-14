// V2.8C — dictionary words sourced from existing stories (small, documented
// batch). These 8 words appear in stories but weren't yet in the dictionary;
// adding them completes story→dictionary links. Deduped at build time.
import type { DictExample } from '@/data/dictionaryCore';

export interface StoryWord {
  chinese: string; pinyin: string; arabic: string; english: string;
  hsk: 1 | 2; examples: DictExample[];
}

export const storyWords: StoryWord[] = [
  { chinese: '起床', pinyin: 'qǐchuáng', arabic: 'يستيقظ', english: 'get up', hsk: 2, examples: [{ zh: '我七点起床。', py: 'wǒ qī diǎn qǐchuáng.', ar: 'أستيقظ في السابعة.' }] },
  { chinese: '饭馆', pinyin: 'fànguǎn', arabic: 'مطعم', english: 'restaurant', hsk: 2, examples: [{ zh: '今天我去饭馆。', py: 'jīntiān wǒ qù fànguǎn.', ar: 'اليوم أذهب إلى المطعم.' }] },
  { chinese: '服务员', pinyin: 'fúwùyuán', arabic: 'نادل', english: 'waiter', hsk: 2, examples: [{ zh: '服务员说：请坐！', py: 'fúwùyuán shuō: qǐng zuò!', ar: 'قال النادل: تفضل بالجلوس!' }] },
  { chinese: '饭店', pinyin: 'fàndiàn', arabic: 'فندق', english: 'hotel', hsk: 2, examples: [{ zh: '我坐出租车去饭店。', py: 'wǒ zuò chūzūchē qù fàndiàn.', ar: 'أذهب إلى الفندق بالتاكسي.' }] },
  { chinese: '到', pinyin: 'dào', arabic: 'يصل', english: 'to arrive', hsk: 2, examples: [{ zh: '我到了饭店。', py: 'wǒ dào le fàndiàn.', ar: 'وصلت إلى الفندق.' }] },
  { chinese: '星期六', pinyin: 'xīngqīliù', arabic: 'السبت', english: 'Saturday', hsk: 2, examples: [{ zh: '今天是星期六。', py: 'jīntiān shì xīngqīliù.', ar: 'اليوم هو السبت.' }] },
  { chinese: '公园', pinyin: 'gōngyuán', arabic: 'حديقة', english: 'park', hsk: 2, examples: [{ zh: '我和朋友去公园。', py: 'wǒ hé péngyou qù gōngyuán.', ar: 'أذهب مع صديقي إلى الحديقة.' }] },
  { chinese: '每天', pinyin: 'měitiān', arabic: 'كل يوم', english: 'every day', hsk: 2, examples: [{ zh: '我每天学汉语。', py: 'wǒ měitiān xué hànyǔ.', ar: 'أتعلم الصينية كل يوم.' }] },
];