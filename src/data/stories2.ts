// V2.2 stories part 2 (6–10), merged into the stories array.
import { stories, type Story } from '@/data/stories';

const part2: Story[] = [
  {
    id: 'market', emoji: '🛍️',
    title_zh: '在商店', title_py: 'zài shāngdiàn', title_ar: 'في السوق', title_en: 'At the Shop',
    stage: 2, relatedLessons: [14, 5],
    vocab: [
      { zh: '商店', py: 'shāngdiàn', ar: 'متجر', en: 'shop' },
      { zh: '衣服', py: 'yīfu', ar: 'ملابس', en: 'clothes' },
      { zh: '钱', py: 'qián', ar: 'نقود', en: 'money' },
      { zh: '买', py: 'mǎi', ar: 'يشتري', en: 'to buy' },
    ],
    sentences: [
      { zh: '我和妈妈去商店。', py: 'wǒ hé māma qù shāngdiàn.', ar: 'أذهب أنا وأمي إلى المتجر.', en: 'Mom and I go to the shop.' },
      { zh: '我看一件衣服。', py: 'wǒ kàn yí jiàn yīfu.', ar: 'أنظر إلى قطعة ملابس.', en: 'I look at a piece of clothing.' },
      { zh: '我问：这件衣服多少钱？', py: 'wǒ wèn: zhè jiàn yīfu duōshao qián?', ar: 'سألت: بكم هذه الملابس؟', en: 'I ask: how much are these clothes?' },
      { zh: '九十块。', py: 'jiǔshí kuài.', ar: 'تسعون يواناً.', en: 'Ninety yuan.' },
      { zh: '妈妈买了衣服。', py: 'māma mǎi le yīfu.', ar: 'اشترت أمي الملابس.', en: 'Mom bought the clothes.' },
      { zh: '我们很高兴。', py: 'wǒmen hěn gāoxìng.', ar: 'نحن سعداء جداً.', en: 'We are very happy.' },
    ],
    quiz: [
      { q_ar: 'مع من ذهب إلى المتجر؟', q_en: 'With whom did he go?', options: ['妈妈', '爸爸', '老师'], correct: '妈妈', pinyin: 'māma' },
      { q_ar: 'كم سعر الملابس؟', q_en: 'How much are the clothes?', options: ['九十块', '十九块', '九块'], correct: '九十块', pinyin: 'jiǔshí kuài' },
      { q_ar: 'كلمة العدّ للملابس:', q_en: 'Measure word for clothes:', options: ['件', '杯', '本'], correct: '件', pinyin: 'jiàn' },
      { q_ar: '"بكم؟" بالصينية:', q_en: '"How much?" in Chinese:', options: ['多少钱', '几岁', '什么'], correct: '多少钱', pinyin: 'duōshao qián' },
      { q_ar: 'اختر البينين الصحيح لـ 商店:', q_en: 'Pinyin of 商店:', chinese: '商店', options: ['shāngdiàn', 'yīfu', 'qián'], correct: 'shāngdiàn' },
    ],
  },
  {
    id: 'taxi', emoji: '🚕',
    title_zh: '我坐出租车', title_py: 'wǒ zuò chūzūchē', title_ar: 'أذهب بالتاكسي', title_en: 'I Take a Taxi',
    stage: 2, relatedLessons: [15, 9],
    vocab: [
      { zh: '出租车', py: 'chūzūchē', ar: 'سيارة أجرة', en: 'taxi' },
      { zh: '饭店', py: 'fàndiàn', ar: 'فندق', en: 'hotel' },
      { zh: '去', py: 'qù', ar: 'يذهب', en: 'to go' },
      { zh: '到', py: 'dào', ar: 'يصل', en: 'to arrive' },
    ],
    sentences: [
      { zh: '我坐出租车去饭店。', py: 'wǒ zuò chūzūchē qù fàndiàn.', ar: 'أذهب إلى الفندق بالتاكسي.', en: 'I take a taxi to the hotel.' },
      { zh: '司机问：去哪儿？', py: 'sījī wèn: qù nǎr?', ar: 'سأل السائق: إلى أين؟', en: 'The driver asks: where to?' },
      { zh: '我说：我去北京饭店。', py: 'wǒ shuō: wǒ qù Běijīng fàndiàn.', ar: 'قلت: أذهب إلى فندق بكين.', en: 'I say: I go to the Beijing Hotel.' },
      { zh: '出租车很快。', py: 'chūzūchē hěn kuài.', ar: 'التاكسي سريع جداً.', en: 'The taxi is very fast.' },
      { zh: '我到了饭店。', py: 'wǒ dào le fàndiàn.', ar: 'وصلت إلى الفندق.', en: 'I arrived at the hotel.' },
      { zh: '我说：谢谢，再见！', py: 'wǒ shuō: xièxie, zàijiàn!', ar: 'قلت: شكراً، مع السلامة!', en: 'I say: thanks, goodbye!' },
    ],
    quiz: [
      { q_ar: 'بماذا ذهب إلى الفندق؟', q_en: 'How did he go?', options: ['出租车', '飞机', '火车'], correct: '出租车', pinyin: 'chūzūchē' },
      { q_ar: 'ماذا سأل السائق؟', q_en: 'What did the driver ask?', options: ['去哪儿？', '几点？', '多少钱？'], correct: '去哪儿？', pinyin: 'qù nǎr?' },
      { q_ar: 'إلى أين يذهب؟', q_en: 'Where is he going?', options: ['北京饭店', '学校', '商店'], correct: '北京饭店', pinyin: 'Běijīng fàndiàn' },
      { q_ar: 'كيف كان التاكسي؟', q_en: 'How was the taxi?', options: ['很快', '很热', '很好吃'], correct: '很快', pinyin: 'hěn kuài' },
      { q_ar: 'ماذا قال في النهاية؟', q_en: 'What did he say at the end?', options: ['谢谢，再见！', '请坐！', '不客气！'], correct: '谢谢，再见！', pinyin: 'xièxie, zàijiàn!' },
    ],
  },
  {
    id: 'saturday', emoji: '📅',
    title_zh: '今天是星期六', title_py: 'jīntiān shì xīngqīliù', title_ar: 'اليوم هو السبت', title_en: 'Today Is Saturday',
    stage: 2, relatedLessons: [7, 12],
    vocab: [
      { zh: '星期六', py: 'xīngqīliù', ar: 'السبت', en: 'Saturday' },
      { zh: '天气', py: 'tiānqì', ar: 'طقس', en: 'weather' },
      { zh: '公园', py: 'gōngyuán', ar: 'حديقة', en: 'park' },
      { zh: '高兴', py: 'gāoxìng', ar: 'سعيد', en: 'happy' },
    ],
    sentences: [
      { zh: '今天是星期六。', py: 'jīntiān shì xīngqīliù.', ar: 'اليوم هو السبت.', en: 'Today is Saturday.' },
      { zh: '今天天气很好。', py: 'jīntiān tiānqì hěn hǎo.', ar: 'الطقس اليوم جميل جداً.', en: 'The weather is very nice today.' },
      { zh: '我不去学校。', py: 'wǒ bú qù xuéxiào.', ar: 'لا أذهب إلى المدرسة.', en: 'I do not go to school.' },
      { zh: '我和朋友去公园。', py: 'wǒ hé péngyou qù gōngyuán.', ar: 'أذهب مع صديقي إلى الحديقة.', en: 'My friend and I go to the park.' },
      { zh: '我们在公园喝茶。', py: 'wǒmen zài gōngyuán hē chá.', ar: 'نشرب الشاي في الحديقة.', en: 'We drink tea in the park.' },
      { zh: '我们很高兴。', py: 'wǒmen hěn gāoxìng.', ar: 'نحن سعداء جداً.', en: 'We are very happy.' },
    ],
    quiz: [
      { q_ar: 'أي يوم اليوم؟', q_en: 'What day is it?', options: ['星期六', '星期一', '星期天'], correct: '星期六', pinyin: 'xīngqīliù' },
      { q_ar: 'كيف الطقس؟', q_en: 'How is the weather?', options: ['很好', '很热', '不好'], correct: '很好', pinyin: 'hěn hǎo' },
      { q_ar: 'إلى أين ذهبا؟', q_en: 'Where did they go?', options: ['公园', '学校', '商店'], correct: '公园', pinyin: 'gōngyuán' },
      { q_ar: 'ماذا شربا في الحديقة؟', q_en: 'What did they drink?', options: ['茶', '水', '咖啡'], correct: '茶', pinyin: 'chá' },
      { q_ar: 'أكمل: 我不___学校。', q_en: 'Complete: 我不___学校。', chinese: '我不___学校。', options: ['去', '是', '喝'], correct: '去', pinyin: 'wǒ bú qù xuéxiào.' },
    ],
  },
  {
    id: 'friend', emoji: '🇨🇳',
    title_zh: '我的中国朋友', title_py: 'wǒ de zhōngguó péngyou', title_ar: 'عندي صديق صيني', title_en: 'My Chinese Friend',
    stage: 2, relatedLessons: [6, 9, 13],
    vocab: [
      { zh: '中国', py: 'zhōngguó', ar: 'الصين', en: 'China' },
      { zh: '会', py: 'huì', ar: 'يستطيع', en: 'can' },
      { zh: '说', py: 'shuō', ar: 'يتكلم', en: 'to speak' },
      { zh: '汉语', py: 'hànyǔ', ar: 'اللغة الصينية', en: 'Chinese language' },
    ],
    sentences: [
      { zh: '我有一个中国朋友。', py: 'wǒ yǒu yí gè zhōngguó péngyou.', ar: 'عندي صديق صيني.', en: 'I have a Chinese friend.' },
      { zh: '他叫王明。', py: 'tā jiào Wáng Míng.', ar: 'اسمه وانغ مينغ.', en: 'His name is Wang Ming.' },
      { zh: '他在饭馆工作。', py: 'tā zài fànguǎn gōngzuò.', ar: 'يعمل في مطعم.', en: 'He works at a restaurant.' },
      { zh: '他会说汉语和英语。', py: 'tā huì shuō hànyǔ hé yīngyǔ.', ar: 'يتحدث الصينية والإنجليزية.', en: 'He speaks Chinese and English.' },
      { zh: '我们都喜欢中国菜。', py: 'wǒmen dōu xǐhuan zhōngguó cài.', ar: 'كلانا نحب الطعام الصيني.', en: 'We both like Chinese food.' },
      { zh: '他是我的好朋友。', py: 'tā shì wǒ de hǎo péngyou.', ar: 'هو صديقي العزيز.', en: 'He is my good friend.' },
    ],
    quiz: [
      { q_ar: 'ما اسم الصديق؟', q_en: "Friend's name?", options: ['王明', '李明', '老师'], correct: '王明', pinyin: 'Wáng Míng' },
      { q_ar: 'أين يعمل؟', q_en: 'Where does he work?', options: ['在饭馆', '在学校', '在商店'], correct: '在饭馆', pinyin: 'zài fànguǎn' },
      { q_ar: 'ماذا يتحدث؟', q_en: 'What does he speak?', options: ['汉语和英语', '汉语', '英语'], correct: '汉语和英语', pinyin: 'hànyǔ hé yīngyǔ' },
      { q_ar: 'ماذا يحبان معاً؟', q_en: 'What do they both like?', options: ['中国菜', '茶', '公园'], correct: '中国菜', pinyin: 'zhōngguó cài' },
      { q_ar: 'أكمل: 他___说汉语。', q_en: 'Complete: 他___说汉语。', chinese: '他___说汉语。', options: ['会', '是', '在'], correct: '会', pinyin: 'tā huì shuō hànyǔ.' },
    ],
  },
  {
    id: 'learning', emoji: '📚',
    title_zh: '我每天学汉语', title_py: 'wǒ měitiān xué hànyǔ', title_ar: 'أتعلم الصينية كل يوم', title_en: 'I Study Chinese Every Day',
    stage: 2, relatedLessons: [6, 11, 7],
    vocab: [
      { zh: '每天', py: 'měitiān', ar: 'كل يوم', en: 'every day' },
      { zh: '学', py: 'xué', ar: 'يتعلم', en: 'to learn' },
      { zh: '写', py: 'xiě', ar: 'يكتب', en: 'to write' },
      { zh: '汉字', py: 'hànzì', ar: 'الحروف الصينية', en: 'Chinese characters' },
    ],
    sentences: [
      { zh: '我每天学汉语。', py: 'wǒ měitiān xué hànyǔ.', ar: 'أتعلم الصينية كل يوم.', en: 'I study Chinese every day.' },
      { zh: '早上我学拼音。', py: 'zǎoshang wǒ xué pīnyīn.', ar: 'في الصباح أتعلم البينين.', en: 'In the morning I learn pinyin.' },
      { zh: '我写五个汉字。', py: 'wǒ xiě wǔ gè hànzì.', ar: 'أكتب خمسة حروف صينية.', en: 'I write five Chinese characters.' },
      { zh: '汉语不难。', py: 'hànyǔ bù nán.', ar: 'الصينية ليست صعبة.', en: 'Chinese is not difficult.' },
      { zh: '现在我会说很多汉语。', py: 'xiànzài wǒ huì shuō hěn duō hànyǔ.', ar: 'الآن أستطيع قول الكثير بالصينية.', en: 'Now I can say a lot in Chinese.' },
      { zh: '我很高兴！', py: 'wǒ hěn gāoxìng!', ar: 'أنا سعيد جداً!', en: 'I am very happy!' },
    ],
    quiz: [
      { q_ar: 'متى يتعلم الصينية؟', q_en: 'When does he study?', options: ['每天', '星期六', '今天'], correct: '每天', pinyin: 'měitiān' },
      { q_ar: 'ماذا يتعلم في الصباح؟', q_en: 'What in the morning?', options: ['拼音', '汉字', '英语'], correct: '拼音', pinyin: 'pīnyīn' },
      { q_ar: 'كم حرفاً يكتب؟', q_en: 'How many characters?', options: ['五个', '三个', '十个'], correct: '五个', pinyin: 'wǔ gè' },
      { q_ar: 'هل الصينية صعبة؟', q_en: 'Is Chinese difficult?', options: ['不难', '很难', '很热'], correct: '不难', pinyin: 'bù nán' },
      { q_ar: 'اختر البينين الصحيح لـ 汉字:', q_en: 'Pinyin of 汉字:', chinese: '汉字', options: ['hànzì', 'hànyǔ', 'pīnyīn'], correct: 'hànzì' },
    ],
  },
];

stories.push(...part2);
export { stories };
