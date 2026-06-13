// V2.2 beginner short stories — original content written for NiHao.
// HSK1-level vocabulary only, short sentences, every sentence has pinyin.

export interface StorySentence { zh: string; py: string; ar: string; en: string }
export interface StoryQuiz {
  q_ar: string; q_en: string; chinese?: string;
  options: string[]; correct: string; pinyin?: string;
}
export interface Story {
  id: string;
  emoji: string;
  title_zh: string; title_py: string; title_ar: string; title_en: string;
  stage: number;              // learning stage (1–2)
  relatedLessons: number[];   // lesson order numbers
  vocab: { zh: string; py: string; ar: string; en: string }[];
  sentences: StorySentence[];
  quiz: StoryQuiz[];
}

export const stories: Story[] = [
  {
    id: 'student', emoji: '🎓',
    title_zh: '我是学生', title_py: 'wǒ shì xuésheng', title_ar: 'أنا طالب', title_en: 'I Am a Student',
    stage: 1, relatedLessons: [1, 3, 4],
    vocab: [
      { zh: '学生', py: 'xuésheng', ar: 'طالب', en: 'student' },
      { zh: '老师', py: 'lǎoshī', ar: 'معلم', en: 'teacher' },
      { zh: '名字', py: 'míngzi', ar: 'اسم', en: 'name' },
      { zh: '朋友', py: 'péngyou', ar: 'صديق', en: 'friend' },
    ],
    sentences: [
      { zh: '你好！我叫李明。', py: 'nǐ hǎo! wǒ jiào Lǐ Míng.', ar: 'مرحباً! اسمي لي مينغ.', en: 'Hello! My name is Li Ming.' },
      { zh: '我是学生。', py: 'wǒ shì xuésheng.', ar: 'أنا طالب.', en: 'I am a student.' },
      { zh: '我的老师是王老师。', py: 'wǒ de lǎoshī shì Wáng lǎoshī.', ar: 'معلمي هو الأستاذ وانغ.', en: 'My teacher is Teacher Wang.' },
      { zh: '他很好。', py: 'tā hěn hǎo.', ar: 'هو طيب جداً.', en: 'He is very nice.' },
      { zh: '我有一个朋友。', py: 'wǒ yǒu yí gè péngyou.', ar: 'عندي صديق واحد.', en: 'I have one friend.' },
      { zh: '他也是学生。', py: 'tā yě shì xuésheng.', ar: 'هو أيضاً طالب.', en: 'He is also a student.' },
    ],
    quiz: [
      { q_ar: 'ما اسم الطالب؟', q_en: "What is the student's name?", options: ['李明', '王老师', '学生'], correct: '李明', pinyin: 'Lǐ Míng' },
      { q_ar: 'ماذا يعمل لي مينغ؟', q_en: 'What is Li Ming?', options: ['学生', '老师', '朋友'], correct: '学生', pinyin: 'xuésheng' },
      { q_ar: 'من هو المعلم؟', q_en: 'Who is the teacher?', options: ['王老师', '李明', '我'], correct: '王老师', pinyin: 'Wáng lǎoshī' },
      { q_ar: 'اختر البينين الصحيح لـ 朋友:', q_en: 'Pinyin of 朋友:', chinese: '朋友', options: ['péngyou', 'míngzi', 'lǎoshī'], correct: 'péngyou' },
      { q_ar: 'أكمل: 他也是___。', q_en: 'Complete: 他也是___。', chinese: '他也是___。', options: ['学生', '名字', '你好'], correct: '学生', pinyin: 'tā yě shì xuésheng.' },
    ],
  },
  {
    id: 'family', emoji: '👨‍👩‍👧',
    title_zh: '我的家', title_py: 'wǒ de jiā', title_ar: 'عائلتي', title_en: 'My Family',
    stage: 1, relatedLessons: [3, 5],
    vocab: [
      { zh: '家', py: 'jiā', ar: 'بيت / عائلة', en: 'home / family' },
      { zh: '爸爸', py: 'bàba', ar: 'أب', en: 'dad' },
      { zh: '妈妈', py: 'māma', ar: 'أم', en: 'mom' },
      { zh: '岁', py: 'suì', ar: 'سنة (عمر)', en: 'years old' },
    ],
    sentences: [
      { zh: '这是我的家。', py: 'zhè shì wǒ de jiā.', ar: 'هذه عائلتي.', en: 'This is my family.' },
      { zh: '我家有四个人。', py: 'wǒ jiā yǒu sì gè rén.', ar: 'في عائلتي أربعة أشخاص.', en: 'There are four people in my family.' },
      { zh: '爸爸是老师。', py: 'bàba shì lǎoshī.', ar: 'أبي معلم.', en: 'Dad is a teacher.' },
      { zh: '妈妈也是老师。', py: 'māma yě shì lǎoshī.', ar: 'أمي أيضاً معلمة.', en: 'Mom is also a teacher.' },
      { zh: '我七岁，我是学生。', py: 'wǒ qī suì, wǒ shì xuésheng.', ar: 'عمري سبع سنوات، أنا طالب.', en: 'I am seven years old, I am a student.' },
      { zh: '我爱我的家。', py: 'wǒ ài wǒ de jiā.', ar: 'أحب عائلتي.', en: 'I love my family.' },
    ],
    quiz: [
      { q_ar: 'كم شخصاً في العائلة؟', q_en: 'How many people in the family?', options: ['四个', '三个', '五个'], correct: '四个', pinyin: 'sì gè' },
      { q_ar: 'ماذا يعمل الأب؟', q_en: 'What is dad?', options: ['老师', '学生', '医生'], correct: '老师', pinyin: 'lǎoshī' },
      { q_ar: 'كم عمر الطفل؟', q_en: 'How old is the child?', options: ['七岁', '四岁', '十岁'], correct: '七岁', pinyin: 'qī suì' },
      { q_ar: 'اختر البينين الصحيح لـ 妈妈:', q_en: 'Pinyin of 妈妈:', chinese: '妈妈', options: ['māma', 'bàba', 'jiā'], correct: 'māma' },
      { q_ar: '"أحب عائلتي" بالصينية:', q_en: '"I love my family":', options: ['我爱我的家', '我家有四个人', '我是学生'], correct: '我爱我的家', pinyin: 'wǒ ài wǒ de jiā' },
    ],
  },
  {
    id: 'school-day', emoji: '🏫',
    title_zh: '我的一天', title_py: 'wǒ de yì tiān', title_ar: 'يومي في المدرسة', title_en: 'My Day at School',
    stage: 2, relatedLessons: [7, 11],
    vocab: [
      { zh: '起床', py: 'qǐchuáng', ar: 'يستيقظ', en: 'get up' },
      { zh: '学校', py: 'xuéxiào', ar: 'مدرسة', en: 'school' },
      { zh: '点', py: 'diǎn', ar: 'الساعة', en: "o'clock" },
      { zh: '学习', py: 'xuéxí', ar: 'يدرس', en: 'to study' },
    ],
    sentences: [
      { zh: '我七点起床。', py: 'wǒ qī diǎn qǐchuáng.', ar: 'أستيقظ في السابعة.', en: 'I get up at seven.' },
      { zh: '八点我去学校。', py: 'bā diǎn wǒ qù xuéxiào.', ar: 'في الثامنة أذهب إلى المدرسة.', en: 'At eight I go to school.' },
      { zh: '我在学校学习汉语。', py: 'wǒ zài xuéxiào xuéxí hànyǔ.', ar: 'أدرس الصينية في المدرسة.', en: 'I study Chinese at school.' },
      { zh: '十二点我喝茶。', py: "shí'èr diǎn wǒ hē chá.", ar: 'في الثانية عشرة أشرب الشاي.', en: 'At twelve I drink tea.' },
      { zh: '今天我很忙。', py: 'jīntiān wǒ hěn máng.', ar: 'اليوم أنا مشغول جداً.', en: 'Today I am very busy.' },
      { zh: '我喜欢我的学校。', py: 'wǒ xǐhuan wǒ de xuéxiào.', ar: 'أحب مدرستي.', en: 'I like my school.' },
    ],
    quiz: [
      { q_ar: 'متى يستيقظ؟', q_en: 'When does he get up?', options: ['七点', '八点', '十二点'], correct: '七点', pinyin: 'qī diǎn' },
      { q_ar: 'أين يدرس الصينية؟', q_en: 'Where does he study Chinese?', options: ['在学校', '在家', '在中国'], correct: '在学校', pinyin: 'zài xuéxiào' },
      { q_ar: 'ماذا يشرب في الثانية عشرة؟', q_en: 'What does he drink at 12?', options: ['茶', '水', '咖啡'], correct: '茶', pinyin: 'chá' },
      { q_ar: 'اختر البينين الصحيح لـ 起床:', q_en: 'Pinyin of 起床:', chinese: '起床', options: ['qǐchuáng', 'xuéxiào', 'xuéxí'], correct: 'qǐchuáng' },
      { q_ar: 'أكمل: 今天我很___。', q_en: 'Complete: 今天我很___。', chinese: '今天我很___。', options: ['忙', '茶', '点'], correct: '忙', pinyin: 'jīntiān wǒ hěn máng.' },
    ],
  },
  {
    id: 'restaurant', emoji: '🍜',
    title_zh: '在饭馆', title_py: 'zài fànguǎn', title_ar: 'في المطعم', title_en: 'At the Restaurant',
    stage: 2, relatedLessons: [8, 10, 13],
    vocab: [
      { zh: '饭馆', py: 'fànguǎn', ar: 'مطعم', en: 'restaurant' },
      { zh: '菜', py: 'cài', ar: 'طبق / طعام', en: 'dish / food' },
      { zh: '好吃', py: 'hǎochī', ar: 'لذيذ', en: 'delicious' },
      { zh: '服务员', py: 'fúwùyuán', ar: 'نادل', en: 'waiter' },
    ],
    sentences: [
      { zh: '今天我去饭馆。', py: 'jīntiān wǒ qù fànguǎn.', ar: 'اليوم أذهب إلى المطعم.', en: 'Today I go to a restaurant.' },
      { zh: '服务员说：请坐！', py: 'fúwùyuán shuō: qǐng zuò!', ar: 'قال النادل: تفضل بالجلوس!', en: 'The waiter says: please sit!' },
      { zh: '我想喝茶。', py: 'wǒ xiǎng hē chá.', ar: 'أريد أن أشرب الشاي.', en: 'I want to drink tea.' },
      { zh: '我要一个中国菜。', py: 'wǒ yào yí gè zhōngguó cài.', ar: 'أريد طبقاً صينياً.', en: 'I want a Chinese dish.' },
      { zh: '中国菜很好吃！', py: 'zhōngguó cài hěn hǎochī!', ar: 'الطعام الصيني لذيذ جداً!', en: 'Chinese food is delicious!' },
      { zh: '我说：谢谢！', py: 'wǒ shuō: xièxie!', ar: 'قلت: شكراً!', en: 'I say: thank you!' },
    ],
    quiz: [
      { q_ar: 'إلى أين يذهب اليوم؟', q_en: 'Where does he go today?', options: ['饭馆', '学校', '中国'], correct: '饭馆', pinyin: 'fànguǎn' },
      { q_ar: 'ماذا قال النادل؟', q_en: 'What did the waiter say?', options: ['请坐', '再见', '不客气'], correct: '请坐', pinyin: 'qǐng zuò' },
      { q_ar: 'ماذا يريد أن يشرب؟', q_en: 'What does he want to drink?', options: ['茶', '水', '咖啡'], correct: '茶', pinyin: 'chá' },
      { q_ar: 'كيف كان الطعام الصيني؟', q_en: 'How was the Chinese food?', options: ['很好吃', '不好吃', '很小'], correct: '很好吃', pinyin: 'hěn hǎochī' },
      { q_ar: 'اختر البينين الصحيح لـ 服务员:', q_en: 'Pinyin of 服务员:', chinese: '服务员', options: ['fúwùyuán', 'fànguǎn', 'hǎochī'], correct: 'fúwùyuán' },
    ],
  },
  {
    id: 'tea', emoji: '🍵',
    title_zh: '我想喝茶', title_py: 'wǒ xiǎng hē chá', title_ar: 'أريد شرب الشاي', title_en: 'I Want to Drink Tea',
    stage: 1, relatedLessons: [8, 14],
    vocab: [
      { zh: '茶', py: 'chá', ar: 'شاي', en: 'tea' },
      { zh: '杯', py: 'bēi', ar: 'كوب', en: 'cup' },
      { zh: '热', py: 'rè', ar: 'حار', en: 'hot' },
      { zh: '块', py: 'kuài', ar: 'يوان (عملة)', en: 'yuan' },
    ],
    sentences: [
      { zh: '今天很热。', py: 'jīntiān hěn rè.', ar: 'اليوم حار جداً.', en: 'Today is very hot.' },
      { zh: '我想喝茶。', py: 'wǒ xiǎng hē chá.', ar: 'أريد أن أشرب الشاي.', en: 'I want to drink tea.' },
      { zh: '我要一杯茶。', py: 'wǒ yào yì bēi chá.', ar: 'أريد كوب شاي.', en: 'I want a cup of tea.' },
      { zh: '一杯茶五块。', py: 'yì bēi chá wǔ kuài.', ar: 'كوب الشاي بخمسة يوانات.', en: 'A cup of tea is five yuan.' },
      { zh: '茶很好喝。', py: 'chá hěn hǎohē.', ar: 'الشاي لذيذ جداً.', en: 'The tea is very good.' },
      { zh: '我也想喝水。', py: 'wǒ yě xiǎng hē shuǐ.', ar: 'أريد أن أشرب الماء أيضاً.', en: 'I also want to drink water.' },
    ],
    quiz: [
      { q_ar: 'كيف الطقس اليوم؟', q_en: 'How is today?', options: ['很热', '很好', '很忙'], correct: '很热', pinyin: 'hěn rè' },
      { q_ar: 'كم سعر كوب الشاي؟', q_en: 'How much is a cup of tea?', options: ['五块', '十块', '一块'], correct: '五块', pinyin: 'wǔ kuài' },
      { q_ar: 'كلمة العدّ للشاي:', q_en: 'Measure word for tea:', options: ['杯', '个', '本'], correct: '杯', pinyin: 'bēi' },
      { q_ar: 'ماذا يريد أن يشرب أيضاً؟', q_en: 'What else does he want?', options: ['水', '茶', '菜'], correct: '水', pinyin: 'shuǐ' },
      { q_ar: 'أكمل: 我想___茶。', q_en: 'Complete: 我想___茶。', chinese: '我想___茶。', options: ['喝', '是', '去'], correct: '喝', pinyin: 'wǒ xiǎng hē chá.' },
    ],
  },
];
