// V2.0.5 extra character-learning data: colored component breakdowns,
// pictograph evolution (original simple SVGs), confusable pairs, character
// families, tone-trainer word pool, and interactive dialogues.
// All content original, written for NiHao.

// ---------- 1) Colored component breakdowns ----------
export interface HanziPart { part: string; color: string; meaning_en: string; meaning_ar: string }
export const hanziParts: Record<string, HanziPart[]> = {
  '好': [
    { part: '女', color: '#f472b6', meaning_en: 'woman', meaning_ar: 'امرأة' },
    { part: '子', color: '#60a5fa', meaning_en: 'child', meaning_ar: 'طفل' },
  ],
  '明': [
    { part: '日', color: '#f59e0b', meaning_en: 'sun', meaning_ar: 'شمس' },
    { part: '月', color: '#a78bfa', meaning_en: 'moon', meaning_ar: 'قمر' },
  ],
  '们': [
    { part: '亻', color: '#34d399', meaning_en: 'person (side form)', meaning_ar: 'إنسان (شكل جانبي)' },
    { part: '门', color: '#60a5fa', meaning_en: 'door', meaning_ar: 'باب' },
  ],
  '妈': [
    { part: '女', color: '#f472b6', meaning_en: 'woman', meaning_ar: 'امرأة' },
    { part: '马', color: '#f59e0b', meaning_en: 'horse (sound mǎ)', meaning_ar: 'حصان (صوت mǎ)' },
  ],
  '吗': [
    { part: '口', color: '#34d399', meaning_en: 'mouth (spoken particle)', meaning_ar: 'فم (أداة منطوقة)' },
    { part: '马', color: '#f59e0b', meaning_en: 'horse (sound ma)', meaning_ar: 'حصان (صوت ma)' },
  ],
};

// ---------- 2) Pictograph evolution (simple original SVGs) ----------
// Each entry: a minimal "ancient drawing" SVG (24x24 viewBox paths) → modern char.
export interface HanziEvolution { char: string; pinyin: string; label_en: string; label_ar: string; svg: string }
export const hanziEvolution: HanziEvolution[] = [
  { char: '日', pinyin: 'rì', label_en: 'sun', label_ar: 'شمس',
    svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>' },
  { char: '月', pinyin: 'yuè', label_en: 'moon', label_ar: 'قمر',
    svg: '<path d="M15 3a9 9 0 1 0 6 15.5A10 10 0 0 1 15 3z" fill="none" stroke="currentColor" stroke-width="1.6"/>' },
  { char: '山', pinyin: 'shān', label_en: 'mountain', label_ar: 'جبل',
    svg: '<path d="M2 20 L8 8 L12 15 L16 5 L22 20 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' },
  { char: '人', pinyin: 'rén', label_en: 'person', label_ar: 'إنسان',
    svg: '<circle cx="12" cy="5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.5 V13 M12 13 L7 21 M12 13 L17 21" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' },
  { char: '口', pinyin: 'kǒu', label_en: 'mouth', label_ar: 'فم',
    svg: '<ellipse cx="12" cy="13" rx="8" ry="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 10 Q12 5 18 10" fill="none" stroke="currentColor" stroke-width="1.4"/>' },
  { char: '木', pinyin: 'mù', label_en: 'tree', label_ar: 'شجرة',
    svg: '<path d="M12 21 V8 M12 8 Q7 8 5 4 M12 8 Q17 8 19 4 M12 13 L7 17 M12 13 L17 17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' },
  { char: '水', pinyin: 'shuǐ', label_en: 'water', label_ar: 'ماء',
    svg: '<path d="M12 3 Q10 8 12 12 Q14 16 12 21 M6 6 Q8 10 6 14 M18 6 Q16 10 18 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' },
  { char: '火', pinyin: 'huǒ', label_en: 'fire', label_ar: 'نار',
    svg: '<path d="M12 21 Q6 17 9 11 Q10 14 12 13 Q11 7 14 3 Q14 8 17 11 Q20 17 12 21 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' },
];

// ---------- 3) Confusable character pairs ----------
export interface ConfusablePair {
  a: string; a_pinyin: string; a_meaning_en: string; a_meaning_ar: string;
  b: string; b_pinyin: string; b_meaning_en: string; b_meaning_ar: string;
  tip_en: string; tip_ar: string;
}
export const confusables: ConfusablePair[] = [
  { a: '人', a_pinyin: 'rén', a_meaning_en: 'person', a_meaning_ar: 'إنسان',
    b: '入', b_pinyin: 'rù', b_meaning_en: 'to enter', b_meaning_ar: 'يدخل',
    tip_en: 'In 人 the left stroke is on top; in 入 the right stroke is on top — like stepping IN with the right foot first.',
    tip_ar: 'في 人 الضربة اليسرى في الأعلى؛ وفي 入 اليمنى في الأعلى — كأنك تدخل بقدمك اليمنى أولاً.' },
  { a: '己', a_pinyin: 'jǐ', a_meaning_en: 'self', a_meaning_ar: 'الذات',
    b: '已', b_pinyin: 'yǐ', b_meaning_en: 'already', b_meaning_ar: 'بالفعل',
    tip_en: '己 is fully open on the top-left; 已 is half closed — "already" half done.',
    tip_ar: '己 مفتوحة تماماً أعلى اليسار؛ و已 نصف مغلقة — "بالفعل" أُنجز نصفها.' },
  { a: '土', a_pinyin: 'tǔ', a_meaning_en: 'earth/soil', a_meaning_ar: 'تراب',
    b: '士', b_pinyin: 'shì', b_meaning_en: 'scholar', b_meaning_ar: 'عالِم',
    tip_en: '土 (soil): bottom line longer — the wide ground. 士 (scholar): top line longer — a wide graduation cap.',
    tip_ar: '土 (تراب): الخط السفلي أطول — الأرض الواسعة. 士 (عالِم): الخط العلوي أطول — قبعة تخرج عريضة.' },
  { a: '末', a_pinyin: 'mò', a_meaning_en: 'end', a_meaning_ar: 'نهاية',
    b: '未', b_pinyin: 'wèi', b_meaning_en: 'not yet', b_meaning_ar: 'ليس بعد',
    tip_en: '末: top stroke longer = the END grew past everything. 未: top stroke shorter = NOT YET fully grown.',
    tip_ar: '末: الخط العلوي أطول = النهاية تجاوزت كل شيء. 未: الخط العلوي أقصر = لم يكتمل النمو بعد.' },
  { a: '大', a_pinyin: 'dà', a_meaning_en: 'big', a_meaning_ar: 'كبير',
    b: '太', b_pinyin: 'tài', b_meaning_en: 'too (much)', b_meaning_ar: 'أكثر من اللازم',
    tip_en: '太 is 大 with an extra dot — big with a little "too much" added.',
    tip_ar: '太 هي 大 مع نقطة زائدة — كبير مع "زيادة" صغيرة.' },
  { a: '日', a_pinyin: 'rì', a_meaning_en: 'sun/day', a_meaning_ar: 'شمس/يوم',
    b: '目', b_pinyin: 'mù', b_meaning_en: 'eye', b_meaning_ar: 'عين',
    tip_en: '日 has one inner line; 目 has two — an eye has more details to see.',
    tip_ar: '日 بداخلها خط واحد؛ و目 بخطين — العين فيها تفاصيل أكثر.' },
];

// ---------- 4) Character families ----------
export interface CharFamily {
  title_en: string; title_ar: string;
  steps: { char: string; pinyin: string; meaning_en: string; meaning_ar: string }[];
  note_en: string; note_ar: string;
}
export const charFamilies: CharFamily[] = [
  {
    title_en: 'One tree, a woods, a forest', title_ar: 'شجرة، غابة صغيرة، غابة كبيرة',
    steps: [
      { char: '木', pinyin: 'mù', meaning_en: 'tree', meaning_ar: 'شجرة' },
      { char: '林', pinyin: 'lín', meaning_en: 'woods', meaning_ar: 'غابة صغيرة' },
      { char: '森', pinyin: 'sēn', meaning_en: 'forest', meaning_ar: 'غابة كثيفة' },
    ],
    note_en: 'Double the tree → woods. Triple it → forest. Characters literally stack meaning!',
    note_ar: 'ضاعف الشجرة ← غابة صغيرة. ثلّثها ← غابة كثيفة. الحروف تُكدّس المعنى حرفياً!',
  },
  {
    title_en: 'Sun + moon = bright', title_ar: 'شمس + قمر = مضيء',
    steps: [
      { char: '日', pinyin: 'rì', meaning_en: 'sun', meaning_ar: 'شمس' },
      { char: '月', pinyin: 'yuè', meaning_en: 'moon', meaning_ar: 'قمر' },
      { char: '明', pinyin: 'míng', meaning_en: 'bright', meaning_ar: 'مضيء' },
    ],
    note_en: 'The two brightest things in the sky combine into "bright" — also in 明天 (tomorrow, the "bright day").',
    note_ar: 'ألمع شيئين في السماء يجتمعان في "مضيء" — وأيضاً في 明天 (غداً، "اليوم المضيء").',
  },
  {
    title_en: 'Person, follow, crowd', title_ar: 'شخص، يتبع، حشد',
    steps: [
      { char: '人', pinyin: 'rén', meaning_en: 'person', meaning_ar: 'إنسان' },
      { char: '从', pinyin: 'cóng', meaning_en: 'to follow / from', meaning_ar: 'يتبع / من' },
      { char: '众', pinyin: 'zhòng', meaning_en: 'crowd', meaning_ar: 'حشد' },
    ],
    note_en: 'One person; two people = one follows the other; three people = a crowd.',
    note_ar: 'شخص واحد؛ شخصان = أحدهما يتبع الآخر؛ ثلاثة = حشد.',
  },
  {
    title_en: 'Mouth + door = ask', title_ar: 'فم + باب = يسأل',
    steps: [
      { char: '口', pinyin: 'kǒu', meaning_en: 'mouth', meaning_ar: 'فم' },
      { char: '门', pinyin: 'mén', meaning_en: 'door', meaning_ar: 'باب' },
      { char: '问', pinyin: 'wèn', meaning_en: 'to ask', meaning_ar: 'يسأل' },
    ],
    note_en: 'A mouth at the door, asking to come in — 问 appears in 请问 (excuse me, may I ask).',
    note_ar: 'فم عند الباب يستأذن بالدخول — وتظهر 问 في 请问 (لو سمحت).',
  },
];

// ---------- 5) Tone trainer word pool ----------
export interface ToneWord { char: string; pinyin: string; tone: 1 | 2 | 3 | 4; meaning_en: string; meaning_ar: string }
export const toneWords: ToneWord[] = [
  { char: '妈', pinyin: 'mā', tone: 1, meaning_en: 'mom', meaning_ar: 'أم' },
  { char: '八', pinyin: 'bā', tone: 1, meaning_en: 'eight', meaning_ar: 'ثمانية' },
  { char: '三', pinyin: 'sān', tone: 1, meaning_en: 'three', meaning_ar: 'ثلاثة' },
  { char: '天', pinyin: 'tiān', tone: 1, meaning_en: 'sky/day', meaning_ar: 'سماء/يوم' },
  { char: '喝', pinyin: 'hē', tone: 1, meaning_en: 'to drink', meaning_ar: 'يشرب' },
  { char: '茶', pinyin: 'chá', tone: 2, meaning_en: 'tea', meaning_ar: 'شاي' },
  { char: '人', pinyin: 'rén', tone: 2, meaning_en: 'person', meaning_ar: 'إنسان' },
  { char: '十', pinyin: 'shí', tone: 2, meaning_en: 'ten', meaning_ar: 'عشرة' },
  { char: '门', pinyin: 'mén', tone: 2, meaning_en: 'door', meaning_ar: 'باب' },
  { char: '来', pinyin: 'lái', tone: 2, meaning_en: 'to come', meaning_ar: 'يأتي' },
  { char: '马', pinyin: 'mǎ', tone: 3, meaning_en: 'horse', meaning_ar: 'حصان' },
  { char: '我', pinyin: 'wǒ', tone: 3, meaning_en: 'I/me', meaning_ar: 'أنا' },
  { char: '好', pinyin: 'hǎo', tone: 3, meaning_en: 'good', meaning_ar: 'جيد' },
  { char: '水', pinyin: 'shuǐ', tone: 3, meaning_en: 'water', meaning_ar: 'ماء' },
  { char: '五', pinyin: 'wǔ', tone: 3, meaning_en: 'five', meaning_ar: 'خمسة' },
  { char: '骂', pinyin: 'mà', tone: 4, meaning_en: 'to scold', meaning_ar: 'يوبّخ' },
  { char: '是', pinyin: 'shì', tone: 4, meaning_en: 'to be', meaning_ar: 'يكون' },
  { char: '六', pinyin: 'liù', tone: 4, meaning_en: 'six', meaning_ar: 'ستة' },
  { char: '大', pinyin: 'dà', tone: 4, meaning_en: 'big', meaning_ar: 'كبير' },
  { char: '去', pinyin: 'qù', tone: 4, meaning_en: 'to go', meaning_ar: 'يذهب' },
];

// ---------- 6) Interactive dialogues ----------
export interface DialogueTurn {
  speaker: 'A' | 'B';
  chinese: string; pinyin: string; english: string; arabic: string;
  /** options shown when the learner (B) must choose; first option is correct after shuffle by UI */
  choices?: { chinese: string; pinyin: string; english: string; arabic: string; correct: boolean }[];
}
export interface Dialogue {
  id: string; icon: string;
  title_en: string; title_ar: string;
  scene_en: string; scene_ar: string;
  turns: DialogueTurn[];
}
export const dialogues: Dialogue[] = [
  {
    id: 'restaurant', icon: '🍜',
    title_en: 'At the restaurant', title_ar: 'في المطعم',
    scene_en: 'You walk into a small noodle restaurant. The waiter greets you.',
    scene_ar: 'تدخل مطعم نودلز صغيراً ويستقبلك النادل.',
    turns: [
      { speaker: 'A', chinese: '您好！请坐。', pinyin: 'Nín hǎo! Qǐng zuò.', english: 'Hello! Please sit.', arabic: 'أهلاً بك! تفضل بالجلوس.' },
      { speaker: 'B', chinese: '谢谢！', pinyin: 'Xièxie!', english: 'Thank you!', arabic: 'شكراً!', choices: [
        { chinese: '谢谢！', pinyin: 'Xièxie!', english: 'Thank you!', arabic: 'شكراً!', correct: true },
        { chinese: '再见！', pinyin: 'Zàijiàn!', english: 'Goodbye!', arabic: 'مع السلامة!', correct: false },
        { chinese: '我很忙。', pinyin: 'Wǒ hěn máng.', english: 'I am busy.', arabic: 'أنا مشغول.', correct: false },
      ] },
      { speaker: 'A', chinese: '你想喝什么？', pinyin: 'Nǐ xiǎng hē shénme?', english: 'What would you like to drink?', arabic: 'ماذا تحب أن تشرب؟' },
      { speaker: 'B', chinese: '我想喝茶。', pinyin: 'Wǒ xiǎng hē chá.', english: 'I would like tea.', arabic: 'أريد شاياً.', choices: [
        { chinese: '我想喝茶。', pinyin: 'Wǒ xiǎng hē chá.', english: 'I would like tea.', arabic: 'أريد شاياً.', correct: true },
        { chinese: '我是学生。', pinyin: 'Wǒ shì xuésheng.', english: 'I am a student.', arabic: 'أنا طالب.', correct: false },
        { chinese: '他喝水。', pinyin: 'Tā hē shuǐ.', english: 'He drinks water.', arabic: 'هو يشرب الماء.', correct: false },
      ] },
      { speaker: 'A', chinese: '好的。这是菜单。', pinyin: 'Hǎo de. Zhè shì càidān.', english: 'OK. Here is the menu.', arabic: 'حسناً. هذه قائمة الطعام.' },
      { speaker: 'B', chinese: '谢谢您！', pinyin: 'Xièxie nín!', english: 'Thank you (polite)!', arabic: 'شكراً لك!', choices: [
        { chinese: '谢谢您！', pinyin: 'Xièxie nín!', english: 'Thank you (polite)!', arabic: 'شكراً لك!', correct: true },
        { chinese: '不客气！', pinyin: 'Bú kèqi!', english: 'You are welcome!', arabic: 'عفواً!', correct: false },
        { chinese: '请坐！', pinyin: 'Qǐng zuò!', english: 'Please sit!', arabic: 'تفضل بالجلوس!', correct: false },
      ] },
    ],
  },
  {
    id: 'taxi', icon: '🚕',
    title_en: 'In the taxi', title_ar: 'في التاكسي',
    scene_en: 'You get into a taxi at the airport.',
    scene_ar: 'تركب سيارة أجرة من المطار.',
    turns: [
      { speaker: 'A', chinese: '您好！去哪儿？', pinyin: 'Nín hǎo! Qù nǎr?', english: 'Hello! Where to?', arabic: 'أهلاً! إلى أين؟' },
      { speaker: 'B', chinese: '我去北京饭店。', pinyin: 'Wǒ qù Běijīng fàndiàn.', english: 'I am going to the Beijing Hotel.', arabic: 'أذهب إلى فندق بكين.', choices: [
        { chinese: '我去北京饭店。', pinyin: 'Wǒ qù Běijīng fàndiàn.', english: 'I am going to the Beijing Hotel.', arabic: 'أذهب إلى فندق بكين.', correct: true },
        { chinese: '我几岁？', pinyin: 'Wǒ jǐ suì?', english: 'How old am I?', arabic: 'كم عمري؟', correct: false },
        { chinese: '这是什么？', pinyin: 'Zhè shì shénme?', english: 'What is this?', arabic: 'ما هذا؟', correct: false },
      ] },
      { speaker: 'A', chinese: '好的，请坐好。', pinyin: 'Hǎo de, qǐng zuò hǎo.', english: 'OK, please sit tight.', arabic: 'حسناً، استقر في جلستك.' },
      { speaker: 'B', chinese: '请问，多少钱？', pinyin: 'Qǐngwèn, duōshao qián?', english: 'Excuse me, how much is it?', arabic: 'لو سمحت، كم الأجرة؟', choices: [
        { chinese: '请问，多少钱？', pinyin: 'Qǐngwèn, duōshao qián?', english: 'Excuse me, how much is it?', arabic: 'لو سمحت، كم الأجرة؟', correct: true },
        { chinese: '天气很好。', pinyin: 'Tiānqì hěn hǎo.', english: 'The weather is nice.', arabic: 'الطقس جميل.', correct: false },
        { chinese: '我会游泳。', pinyin: 'Wǒ huì yóuyǒng.', english: 'I can swim.', arabic: 'أجيد السباحة.', correct: false },
      ] },
      { speaker: 'A', chinese: '三十块。', pinyin: 'Sānshí kuài.', english: '30 yuan.', arabic: '٣٠ يواناً.' },
      { speaker: 'B', chinese: '好的，谢谢！', pinyin: 'Hǎo de, xièxie!', english: 'OK, thanks!', arabic: 'حسناً، شكراً!', choices: [
        { chinese: '好的，谢谢！', pinyin: 'Hǎo de, xièxie!', english: 'OK, thanks!', arabic: 'حسناً، شكراً!', correct: true },
        { chinese: '我不是老师。', pinyin: 'Wǒ bú shì lǎoshī.', english: 'I am not a teacher.', arabic: 'لستُ معلماً.', correct: false },
        { chinese: '星期五。', pinyin: 'Xīngqīwǔ.', english: 'Friday.', arabic: 'الجمعة.', correct: false },
      ] },
    ],
  },
  {
    id: 'shop', icon: '🛍️',
    title_en: 'Buying clothes', title_ar: 'شراء الملابس',
    scene_en: 'You are in a clothes shop and like a shirt.',
    scene_ar: 'أنت في متجر ملابس وأعجبك قميص.',
    turns: [
      { speaker: 'A', chinese: '您好！欢迎！', pinyin: 'Nín hǎo! Huānyíng!', english: 'Hello! Welcome!', arabic: 'أهلاً! مرحباً بك!' },
      { speaker: 'B', chinese: '请问，这件衣服多少钱？', pinyin: 'Qǐngwèn, zhè jiàn yīfu duōshao qián?', english: 'Excuse me, how much is this?', arabic: 'لو سمحت، بكم هذه القطعة؟', choices: [
        { chinese: '请问，这件衣服多少钱？', pinyin: 'Qǐngwèn, zhè jiàn yīfu duōshao qián?', english: 'Excuse me, how much is this?', arabic: 'لو سمحت، بكم هذه القطعة؟', correct: true },
        { chinese: '今天几号？', pinyin: 'Jīntiān jǐ hào?', english: 'What date is it?', arabic: 'كم التاريخ اليوم؟', correct: false },
        { chinese: '你在哪儿工作？', pinyin: 'Nǐ zài nǎr gōngzuò?', english: 'Where do you work?', arabic: 'أين تعمل؟', correct: false },
      ] },
      { speaker: 'A', chinese: '九十九块。', pinyin: 'Jiǔshíjiǔ kuài.', english: '99 yuan.', arabic: '٩٩ يواناً.' },
      { speaker: 'B', chinese: '有点贵。便宜一点，好吗？', pinyin: 'Yǒudiǎn guì. Piányi yìdiǎn, hǎo ma?', english: 'A bit expensive. A little cheaper, OK?', arabic: 'غالٍ قليلاً. خفّض السعر قليلاً، اتفقنا؟', choices: [
        { chinese: '有点贵。便宜一点，好吗？', pinyin: 'Yǒudiǎn guì. Piányi yìdiǎn, hǎo ma?', english: 'A bit expensive. A little cheaper, OK?', arabic: 'غالٍ قليلاً. خفّض السعر قليلاً، اتفقنا؟', correct: true },
        { chinese: '我也喜欢茶。', pinyin: 'Wǒ yě xǐhuan chá.', english: 'I also like tea.', arabic: 'أنا أيضاً أحب الشاي.', correct: false },
        { chinese: '他是我的老师。', pinyin: 'Tā shì wǒ de lǎoshī.', english: 'He is my teacher.', arabic: 'هو معلمي.', correct: false },
      ] },
      { speaker: 'A', chinese: '好吧，八十块。', pinyin: 'Hǎo ba, bāshí kuài.', english: 'Alright, 80 yuan.', arabic: 'حسناً، ٨٠ يواناً.' },
      { speaker: 'B', chinese: '好的，我要这件。谢谢！', pinyin: 'Hǎo de, wǒ yào zhè jiàn. Xièxie!', english: 'OK, I will take this one. Thanks!', arabic: 'حسناً، سآخذ هذه. شكراً!', choices: [
        { chinese: '好的，我要这件。谢谢！', pinyin: 'Hǎo de, wǒ yào zhè jiàn. Xièxie!', english: 'OK, I will take this one. Thanks!', arabic: 'حسناً، سآخذ هذه. شكراً!', correct: true },
        { chinese: '再见！', pinyin: 'Zàijiàn!', english: 'Goodbye!', arabic: 'مع السلامة!', correct: false },
        { chinese: '我不会做饭。', pinyin: 'Wǒ bú huì zuò fàn.', english: 'I cannot cook.', arabic: 'لا أجيد الطبخ.', correct: false },
      ] },
    ],
  },
];
