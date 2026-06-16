// V3.4.1 — pinyin lookup for HSK simulation answer options. Options are plain
// strings (Chinese words, numbers, Arabic glosses, or pinyin). We only want to
// show pinyin under *Chinese* options. This builds a Chinese→pinyin map from the
// simulation datasets themselves (each question already pairs its spoken/correct
// Chinese with a pinyin), plus a few common HSK1 words, so options like 你好 /
// 再见 / 谢谢 get their pinyin without adding pinyin to every option by hand.
import { HSK1_QUESTIONS } from '@/data/hsk1sim';
import { HSK2_QUESTIONS } from '@/data/hsk2sim';
import { HSK3_QUESTIONS } from '@/data/hsk3sim';

// Only Han characters (no Latin/Arabic/digits) → eligible for pinyin display.
const HAN_ONLY = /^[\u3400-\u9FFF\uF900-\uFAFF]+$/;

export function isChineseText(s: string): boolean {
  return HAN_ONLY.test(s.trim());
}

// Seed map: high-frequency HSK1 words that appear as listening options.
const SEED: Record<string, string> = {
  '你好': 'nǐ hǎo', '再见': 'zàijiàn', '谢谢': 'xièxie', '不客气': 'bú kèqi',
  '请坐': 'qǐng zuò', '没关系': 'méi guānxi', '对不起': 'duìbuqǐ', '请问': 'qǐngwèn',
  '老师': 'lǎoshī', '学生': 'xuésheng', '朋友': 'péngyou', '名字': 'míngzi',
  '中国': 'zhōngguó', '学校': 'xuéxiào', '饭馆': 'fànguǎn', '医院': 'yīyuàn',
  '商店': 'shāngdiàn', '今天': 'jīntiān', '明天': 'míngtiān', '昨天': 'zuótiān',
  '现在': 'xiànzài', '喜欢': 'xǐhuān', '吃饭': 'chīfàn', '喝水': 'hē shuǐ',
  '什么': 'shénme', '哪儿': 'nǎr', '怎么': 'zěnme', '多少': 'duōshao',
  // V3.4.1: fill gaps for HSK1/HSK2 Chinese options that lacked pinyin.
  '很': 'hěn', '吃': 'chī', '看': 'kàn', '的': 'de', '高': 'gāo', '新': 'xīn',
  '远': 'yuǎn', '累': 'lèi', '帮助': 'bāngzhù', '个': 'gè', '本': 'běn',
  '但是': 'dànshì', '可是': 'kěshì', '一个茶': 'yí ge chá', '一本茶': 'yì běn chá',
  '我不有猫': 'wǒ bù yǒu māo', '没我有猫': 'méi wǒ yǒu māo',
  '中国去我': 'zhōngguó qù wǒ', '去我中国': 'qù wǒ zhōngguó',
  '天气今天很好': 'tiānqì jīntiān hěn hǎo', '很好今天天气': 'hěn hǎo jīntiān tiānqì',
  '我到已经了': 'wǒ dào yǐjīng le', '已经我到了': 'yǐjīng wǒ dào le',
};

function buildMap(): Record<string, string> {
  const map: Record<string, string> = { ...SEED };
  // Each question pairs its audio/correct Chinese with a pinyin; harvest those.
  for (const q of [...HSK1_QUESTIONS, ...HSK2_QUESTIONS, ...HSK3_QUESTIONS]) {
    const py = q.pinyin;
    if (!py) continue;
    if (q.audio && isChineseText(q.audio)) map[q.audio] = map[q.audio] || py;
    if (q.chinese && isChineseText(q.chinese)) map[q.chinese] = map[q.chinese] || py;
    if (isChineseText(q.correct)) map[q.correct] = map[q.correct] || py;
  }
  return map;
}

const PINYIN_MAP = buildMap();

/** Pinyin for a Chinese option string, or undefined if not Chinese / unknown. */
export function pinyinForOption(option: string): string | undefined {
  const s = option.trim();
  if (!isChineseText(s)) return undefined;
  return PINYIN_MAP[s];
}
