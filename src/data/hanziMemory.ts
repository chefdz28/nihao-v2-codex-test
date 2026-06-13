// V2.0.4 Character Memory data — original beginner-friendly mnemonics
// (inspired by the general idea of visual character stories; all text written
// for NiHao, no copyrighted material reproduced).

export interface HanziMemory {
  char: string;
  pinyin: string;
  meaning_en: string;
  meaning_ar: string;
  memory_en: string;
  memory_ar: string;
  components?: string;       // radical / component breakdown when useful
  stroke_hint?: string;      // simple stroke-order hint
  example_word: { chinese: string; pinyin: string; english: string; arabic: string };
  example_sentence: { chinese: string; pinyin: string; english: string; arabic: string };
}

export const hanziMemory: HanziMemory[] = [
  {
    char: '人', pinyin: 'rén', meaning_en: 'person', meaning_ar: 'إنسان',
    memory_en: 'Two strokes like two legs — a person walking.',
    memory_ar: 'خطّان مثل ساقين — إنسان يمشي.',
    stroke_hint: 'Left-falling stroke first, then right-falling.',
    example_word: { chinese: '中国人', pinyin: 'zhōngguó rén', english: 'Chinese person', arabic: 'صيني (شخص)' },
    example_sentence: { chinese: '他是好人。', pinyin: 'tā shì hǎo rén.', english: 'He is a good person.', arabic: 'هو شخص طيب.' },
  },
  {
    char: '口', pinyin: 'kǒu', meaning_en: 'mouth', meaning_ar: 'فم',
    memory_en: 'A square frame like an open mouth.',
    memory_ar: 'إطار مربع مثل فم مفتوح.',
    stroke_hint: 'Three strokes: left side, then top+right, then bottom.',
    example_word: { chinese: '人口', pinyin: 'rénkǒu', english: 'population', arabic: 'عدد السكان' },
    example_sentence: { chinese: '请开口说汉语。', pinyin: 'qǐng kāikǒu shuō hànyǔ.', english: 'Please open your mouth and speak Chinese.', arabic: 'تفضل تكلّم بالصينية.' },
  },
  {
    char: '日', pinyin: 'rì', meaning_en: 'sun / day', meaning_ar: 'شمس / يوم',
    memory_en: 'Originally a circle with a dot — the sun. Now a box with a line.',
    memory_ar: 'كانت في الأصل دائرة بنقطة — الشمس. والآن مربع بداخله خط.',
    example_word: { chinese: '生日', pinyin: 'shēngrì', english: 'birthday', arabic: 'عيد ميلاد' },
    example_sentence: { chinese: '今天是好日子。', pinyin: 'jīntiān shì hǎo rìzi.', english: 'Today is a good day.', arabic: 'اليوم يوم جميل.' },
  },
  {
    char: '月', pinyin: 'yuè', meaning_en: 'moon / month', meaning_ar: 'قمر / شهر',
    memory_en: 'A crescent moon shape — and months follow the moon.',
    memory_ar: 'شكل هلال القمر — والشهور تتبع القمر.',
    example_word: { chinese: '一月', pinyin: 'yī yuè', english: 'January', arabic: 'يناير' },
    example_sentence: { chinese: '六月很热。', pinyin: 'liù yuè hěn rè.', english: 'June is very hot.', arabic: 'يونيو حار جداً.' },
  },
  {
    char: '木', pinyin: 'mù', meaning_en: 'tree / wood', meaning_ar: 'شجرة / خشب',
    memory_en: 'A trunk with branches up and roots down.',
    memory_ar: 'جذع بأغصان للأعلى وجذور للأسفل.',
    components: 'Doubled it becomes 林 (woods); tripled 森 (forest).',
    example_word: { chinese: '木头', pinyin: 'mùtou', english: 'wood', arabic: 'خشب' },
    example_sentence: { chinese: '这是木桌子。', pinyin: 'zhè shì mù zhuōzi.', english: 'This is a wooden table.', arabic: 'هذه طاولة خشبية.' },
  },
  {
    char: '好', pinyin: 'hǎo', meaning_en: 'good', meaning_ar: 'جيد',
    memory_en: 'A traditional composition of 女 (woman) + 子 (child) — in ancient character design this pairing represented something good. It is a historical composition, not a modern rule.',
    memory_ar: 'تركيب تقليدي من 女 (امرأة) + 子 (طفل) — في تصميم الحروف القديم رمز هذا الاقتران لشيء حسن. وهو تركيب تاريخي وليس قاعدة اجتماعية حديثة.',
    components: '女 (woman) + 子 (child)',
    example_word: { chinese: '你好', pinyin: 'nǐ hǎo', english: 'hello', arabic: 'مرحباً' },
    example_sentence: { chinese: '中国菜很好吃。', pinyin: 'zhōngguó cài hěn hǎochī.', english: 'Chinese food is delicious.', arabic: 'الطعام الصيني لذيذ.' },
  },
  {
    char: '大', pinyin: 'dà', meaning_en: 'big', meaning_ar: 'كبير',
    memory_en: 'A person (人) stretching both arms wide — "this big!"',
    memory_ar: 'إنسان (人) يمدّ ذراعيه على وسعهما — "بهذا الحجم!"',
    components: '人 (person) + a wide stroke for the arms',
    example_word: { chinese: '大学', pinyin: 'dàxué', english: 'university', arabic: 'جامعة' },
    example_sentence: { chinese: '这个很大。', pinyin: 'zhège hěn dà.', english: 'This one is very big.', arabic: 'هذا كبير جداً.' },
  },
  {
    char: '小', pinyin: 'xiǎo', meaning_en: 'small', meaning_ar: 'صغير',
    memory_en: 'A center hook with two small drops shrinking away.',
    memory_ar: 'خطاف في المنتصف ونقطتان صغيرتان تتلاشيان.',
    stroke_hint: 'Middle hook first, then left dot, then right dot.',
    example_word: { chinese: '小学', pinyin: 'xiǎoxué', english: 'primary school', arabic: 'مدرسة ابتدائية' },
    example_sentence: { chinese: '我家很小。', pinyin: 'wǒ jiā hěn xiǎo.', english: 'My home is small.', arabic: 'بيتي صغير.' },
  },
  {
    char: '山', pinyin: 'shān', meaning_en: 'mountain', meaning_ar: 'جبل',
    memory_en: 'Three peaks rising — a mountain range.',
    memory_ar: 'ثلاث قمم مرتفعة — سلسلة جبال.',
    example_word: { chinese: '高山', pinyin: 'gāo shān', english: 'high mountain', arabic: 'جبل عالٍ' },
    example_sentence: { chinese: '山很高。', pinyin: 'shān hěn gāo.', english: 'The mountain is high.', arabic: 'الجبل عالٍ.' },
  },
  {
    char: '水', pinyin: 'shuǐ', meaning_en: 'water', meaning_ar: 'ماء',
    memory_en: 'A central stream with splashes on both sides.',
    memory_ar: 'جدول في المنتصف ورذاذ على الجانبين.',
    example_word: { chinese: '喝水', pinyin: 'hē shuǐ', english: 'drink water', arabic: 'يشرب الماء' },
    example_sentence: { chinese: '我想喝水。', pinyin: 'wǒ xiǎng hē shuǐ.', english: 'I want to drink water.', arabic: 'أريد أن أشرب الماء.' },
  },
  {
    char: '火', pinyin: 'huǒ', meaning_en: 'fire', meaning_ar: 'نار',
    memory_en: 'A person-like core with sparks flying off.',
    memory_ar: 'نواة تشبه إنساناً وشرر يتطاير حولها.',
    example_word: { chinese: '火车', pinyin: 'huǒchē', english: 'train (fire vehicle)', arabic: 'قطار' },
    example_sentence: { chinese: '我坐火车去北京。', pinyin: 'wǒ zuò huǒchē qù Běijīng.', english: 'I take the train to Beijing.', arabic: 'أذهب إلى بكين بالقطار.' },
  },
  {
    char: '门', pinyin: 'mén', meaning_en: 'door / gate', meaning_ar: 'باب / بوابة',
    memory_en: 'A doorway frame — the simplified form of double swinging doors.',
    memory_ar: 'إطار مدخل — الشكل المبسّط لبابين متأرجحين.',
    example_word: { chinese: '开门', pinyin: 'kāi mén', english: 'open the door', arabic: 'يفتح الباب' },
    example_sentence: { chinese: '请开门。', pinyin: 'qǐng kāi mén.', english: 'Please open the door.', arabic: 'من فضلك افتح الباب.' },
  },
];

/** quick lookup by single character */
export const hanziByChar: Record<string, HanziMemory> = Object.fromEntries(
  hanziMemory.map(h => [h.char, h]),
);
