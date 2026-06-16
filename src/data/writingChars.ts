// V3.3 — Character writing practice data. Original content for NiHao: each entry
// has the character, pinyin, Arabic meaning, and stroke count (from the standard
// public stroke-order of each character). No copyrighted book scans/screenshots.
export interface WritingChar {
  chinese: string;
  pinyin: string;
  arabic: string;
  strokes: number;
  hsk: 1 | 2 | 3;
}

export const writingChars: WritingChar[] = [
  { chinese: '我', pinyin: 'wǒ', arabic: 'أنا', strokes: 7, hsk: 1 },
  { chinese: '你', pinyin: 'nǐ', arabic: 'أنتَ', strokes: 7, hsk: 1 },
  { chinese: '他', pinyin: 'tā', arabic: 'هو', strokes: 5, hsk: 1 },
  { chinese: '她', pinyin: 'tā', arabic: 'هي', strokes: 6, hsk: 1 },
  { chinese: '好', pinyin: 'hǎo', arabic: 'جيد / حسن', strokes: 6, hsk: 1 },
  { chinese: '学', pinyin: 'xué', arabic: 'يتعلّم', strokes: 8, hsk: 1 },
  { chinese: '中', pinyin: 'zhōng', arabic: 'وسط / الصين', strokes: 4, hsk: 1 },
  { chinese: '文', pinyin: 'wén', arabic: 'لغة / كتابة', strokes: 4, hsk: 1 },
  { chinese: '人', pinyin: 'rén', arabic: 'إنسان', strokes: 2, hsk: 1 },
  { chinese: '日', pinyin: 'rì', arabic: 'يوم / شمس', strokes: 4, hsk: 1 },
  { chinese: '月', pinyin: 'yuè', arabic: 'شهر / قمر', strokes: 4, hsk: 1 },
  { chinese: '水', pinyin: 'shuǐ', arabic: 'ماء', strokes: 4, hsk: 1 },
  { chinese: '火', pinyin: 'huǒ', arabic: 'نار', strokes: 4, hsk: 2 },
  { chinese: '山', pinyin: 'shān', arabic: 'جبل', strokes: 3, hsk: 2 },
  { chinese: '口', pinyin: 'kǒu', arabic: 'فم', strokes: 3, hsk: 1 },
  { chinese: '大', pinyin: 'dà', arabic: 'كبير', strokes: 3, hsk: 1 },
  { chinese: '小', pinyin: 'xiǎo', arabic: 'صغير', strokes: 3, hsk: 1 },
  { chinese: '天', pinyin: 'tiān', arabic: 'سماء / يوم', strokes: 4, hsk: 1 },
  { chinese: '去', pinyin: 'qù', arabic: 'يذهب', strokes: 5, hsk: 1 },
  { chinese: '来', pinyin: 'lái', arabic: 'يأتي', strokes: 7, hsk: 1 },
  { chinese: '吃', pinyin: 'chī', arabic: 'يأكل', strokes: 6, hsk: 1 },
  { chinese: '喝', pinyin: 'hē', arabic: 'يشرب', strokes: 12, hsk: 1 },
  { chinese: '看', pinyin: 'kàn', arabic: 'ينظر / يشاهد', strokes: 9, hsk: 1 },
  { chinese: '听', pinyin: 'tīng', arabic: 'يستمع', strokes: 7, hsk: 1 },
  { chinese: '说', pinyin: 'shuō', arabic: 'يتكلّم', strokes: 9, hsk: 1 },
  { chinese: '写', pinyin: 'xiě', arabic: 'يكتب', strokes: 5, hsk: 1 },
  { chinese: '读', pinyin: 'dú', arabic: 'يقرأ', strokes: 10, hsk: 1 },
  { chinese: '书', pinyin: 'shū', arabic: 'كتاب', strokes: 4, hsk: 1 },
  { chinese: '家', pinyin: 'jiā', arabic: 'بيت / عائلة', strokes: 10, hsk: 1 },
  { chinese: '学校', pinyin: 'xuéxiào', arabic: 'مدرسة', strokes: 18, hsk: 1 },
];
