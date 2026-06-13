// Supabase Edge Function: Process uploaded PDFs
// Extracts text, generates draft lessons, vocabulary, sentences, and quiz questions

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// @ts-ignore - Deno npm compatibility
import * as pdfjsLib from 'npm:pdfjs-dist@4.6.82/legacy/build/pdf.mjs';

// ============================================================
// HSK 1 CURRICULUM DATA - organized by topic for draft generation
// ============================================================

interface VocabItem {
  chinese: string;
  pinyin: string;
  arabic: string;
  english: string;
  example: string;
  exampleAr: string;
  exampleEn: string;
}

interface LessonTemplate {
  title_en: string;
  title_ar: string;
  objective_en: string;
  objective_ar: string;
  vocabulary: VocabItem[];
  sentences: Array<{ chinese: string; pinyin: string; arabic: string; english: string }>;
  estimated_minutes: number;
}

// HSK 1 standard vocabulary organized by lesson topics
const HSK1_LESSONS: LessonTemplate[] = [
  {
    title_en: 'Greetings & Introductions',
    title_ar: 'التحيات والتعارف',
    objective_en: 'Learn how to greet people, introduce yourself, and say goodbye in Chinese.',
    objective_ar: 'تعلم كيفية تحية الناس وتقديم نفسك والوداع باللغة الصينية.',
    estimated_minutes: 20,
    vocabulary: [
      { chinese: '你好', pinyin: 'nǐ hǎo', arabic: 'مرحبا', english: 'Hello', example: '你好，我是小明。', exampleAr: 'مرحبا، أنا شياومينغ.', exampleEn: 'Hello, I am Xiaoming.' },
      { chinese: '再见', pinyin: 'zài jiàn', arabic: 'وداعا', english: 'Goodbye', example: '再见，明天见。', exampleAr: 'وداعا، أراك غدا.', exampleEn: 'Goodbye, see you tomorrow.' },
      { chinese: '谢谢', pinyin: 'xiè xie', arabic: 'شكرا', english: 'Thank you', example: '谢谢你的帮助。', exampleAr: 'شكرا على مساعدتك.', exampleEn: 'Thank you for your help.' },
      { chinese: '不客气', pinyin: 'bú kè qi', arabic: 'على الرحب والسعة', english: "You're welcome", example: '不客气，我很高兴帮助你。', exampleAr: 'على الرحب، أنا سعيد بمساعدتك.', exampleEn: "You're welcome, I'm happy to help you." },
      { chinese: '对不起', pinyin: 'duì bù qǐ', arabic: 'آسف', english: 'Sorry', example: '对不起，我迟到了。', exampleAr: 'آسف، لقد تأخرت.', exampleEn: 'Sorry, I am late.' },
      { chinese: '没关系', pinyin: 'méi guān xi', arabic: 'لا بأس', english: "It's okay", example: '没关系，下次注意。', exampleAr: 'لا بأس، انتبه المرة القادمة.', exampleEn: "It's okay, pay attention next time." },
      { chinese: '请', pinyin: 'qǐng', arabic: 'من فضلك', english: 'Please', example: '请进。', exampleAr: 'تفضل بالدخول.', exampleEn: 'Please come in.' },
      { chinese: '是', pinyin: 'shì', arabic: 'نعم / هو', english: 'Yes / To be', example: '我是学生。', exampleAr: 'أنا طالب.', exampleEn: 'I am a student.' },
    ],
    sentences: [
      { chinese: '你好！我叫王明。', pinyin: 'Nǐ hǎo! Wǒ jiào Wáng Míng.', arabic: 'مرحبا! اسمي وانغ مينغ.', english: 'Hello! My name is Wang Ming.' },
      { chinese: '你好吗？', pinyin: 'Nǐ hǎo ma?', arabic: 'كيف حالك؟', english: 'How are you?' },
      { chinese: '我很好，谢谢！', pinyin: 'Wǒ hěn hǎo, xiè xie!', arabic: 'أنا بخير، شكرا!', english: 'I am fine, thank you!' },
      { chinese: '很高兴认识你。', pinyin: 'Hěn gāo xìng rèn shi nǐ.', arabic: 'سعيد بمعرفتك.', english: 'Nice to meet you.' },
    ],
  },
  {
    title_en: 'Numbers & Counting',
    title_ar: 'الأرقام والعد',
    objective_en: 'Master Chinese numbers from 1 to 10 and learn how to count objects.',
    objective_ar: 'أتقن الأرقام الصينية من 1 إلى 10 وتعلم كيفية عد الأشياء.',
    estimated_minutes: 25,
    vocabulary: [
      { chinese: '一', pinyin: 'yī', arabic: 'واحد', english: 'One', example: '我有一个弟弟。', exampleAr: 'لدي أخ صغير.', exampleEn: 'I have a younger brother.' },
      { chinese: '二', pinyin: 'èr', arabic: 'اثنان', english: 'Two', example: '我有二本书。', exampleAr: 'لدي كتابان.', exampleEn: 'I have two books.' },
      { chinese: '三', pinyin: 'sān', arabic: 'ثلاثة', english: 'Three', example: '他家有三口人。', exampleAr: 'عائلته مكونة من ثلاثة أشخاص.', exampleEn: 'His family has three people.' },
      { chinese: '四', pinyin: 'sì', arabic: 'أربعة', english: 'Four', example: '现在是四点。', exampleAr: 'الساعة الآن الرابعة.', exampleEn: 'It is four o'clock now.' },
      { chinese: '五', pinyin: 'wǔ', arabic: 'خمسة', english: 'Five', example: '我五岁了。', exampleAr: 'عمري خمس سنوات.', exampleEn: 'I am five years old.' },
      { chinese: '六', pinyin: 'liù', arabic: 'ستة', english: 'Six', example: '六月是我的生日。', exampleAr: 'يونيو هو عيد ميلادي.', exampleEn: 'June is my birthday.' },
      { chinese: '七', pinyin: 'qī', arabic: 'سبعة', english: 'Seven', example: '一星期有七天。', exampleAr: 'الأسبوع يحتوي على سبعة أيام.', exampleEn: 'A week has seven days.' },
      { chinese: '八', pinyin: 'bā', arabic: 'ثمانية', english: 'Eight', example: '我八点上课。', exampleAr: 'أبدأ الدراسة في الثامنة.', exampleEn: 'I start class at eight.' },
      { chinese: '九', pinyin: 'jiǔ', arabic: 'تسعة', english: 'Nine', example: '他九岁了。', exampleAr: 'عمره تسع سنوات.', exampleEn: 'He is nine years old.' },
      { chinese: '十', pinyin: 'shí', arabic: 'عشرة', english: 'Ten', example: '十个人在教室里。', exampleAr: 'هناك عشرة أشخاص في الفصل.', exampleEn: 'There are ten people in the classroom.' },
    ],
    sentences: [
      { chinese: '我会数数。', pinyin: 'Wǒ huì shǔ shù.', arabic: 'أستطيع العد.', english: 'I can count.' },
      { chinese: '我有三个苹果。', pinyin: 'Wǒ yǒu sān gè píng guǒ.', arabic: 'لدي ثلاثة تفاحات.', english: 'I have three apples.' },
      { chinese: '他今年八岁。', pinyin: 'Tā jīn nián bā suì.', arabic: 'عمره ثماني سنوات هذا العام.', english: 'He is eight years old this year.' },
      { chinese: '一个星期有七天。', pinyin: 'Yī gè xīng qī yǒu qī tiān.', arabic: 'الأسبوع يحتوي على سبعة أيام.', english: 'A week has seven days.' },
    ],
  },
  {
    title_en: 'Family Members',
    title_ar: 'أفراد العائلة',
    objective_en: 'Learn vocabulary for family members and how to talk about your family.',
    objective_ar: 'تعلم مفردات أفراد العائلة وكيفية التحدث عن عائلتك.',
    estimated_minutes: 25,
    vocabulary: [
      { chinese: '家', pinyin: 'jiā', arabic: 'عائلة / منزل', english: 'Family / Home', example: '我家有五口人。', exampleAr: 'عائلتي مكونة من خمسة أشخاص.', exampleEn: 'My family has five people.' },
      { chinese: '爸爸', pinyin: 'bà ba', arabic: 'أب', english: 'Father', example: '我的爸爸是医生。', exampleAr: 'أبي طبيب.', exampleEn: 'My father is a doctor.' },
      { chinese: '妈妈', pinyin: 'mā ma', arabic: 'أم', english: 'Mother', example: '我的妈妈很漂亮。', exampleAr: 'أمي جميلة جدا.', exampleEn: 'My mother is very beautiful.' },
      { chinese: '哥哥', pinyin: 'gē ge', arabic: 'أخ أكبر', english: 'Older brother', example: '我哥哥上大学。', exampleAr: 'أخي الأكبر في الجامعة.', exampleEn: 'My older brother is in university.' },
      { chinese: '姐姐', pinyin: 'jiě jie', arabic: 'أخت أكبر', english: 'Older sister', example: '我姐姐喜欢唱歌。', exampleAr: 'أختي الكبرى تحب الغناء.', exampleEn: 'My older sister likes singing.' },
      { chinese: '弟弟', pinyin: 'dì di', arabic: 'أخ أصغر', english: 'Younger brother', example: '我弟弟今年三岁。', exampleAr: 'أخي الأصغر عمره ثلاث سنوات هذا العام.', exampleEn: 'My younger brother is three years old this year.' },
      { chinese: '妹妹', pinyin: 'mèi mei', arabic: 'أخت أصغر', english: 'Younger sister', example: '我妹妹很可爱。', exampleAr: 'أختي الصغرى لطيفة جدا.', exampleEn: 'My younger sister is very cute.' },
      { chinese: '儿子', pinyin: 'ér zi', arabic: 'ابن', english: 'Son', example: '他有一个儿子。', exampleAr: 'لديه ابن.', exampleEn: 'He has a son.' },
    ],
    sentences: [
      { chinese: '我家有五口人。', pinyin: 'Wǒ jiā yǒu wǔ kǒu rén.', arabic: 'عائلتي مكونة من خمسة أشخاص.', english: 'There are five people in my family.' },
      { chinese: '爸爸工作很忙。', pinyin: 'Bà ba gōng zuò hěn máng.', arabic: 'أبي مشغول جدا بالعمل.', english: 'Father is very busy with work.' },
      { chinese: '我爱我的妈妈。', pinyin: 'Wǒ ài wǒ de mā ma.', arabic: 'أحب أمي.', english: 'I love my mother.' },
      { chinese: '你叫什么名字？', pinyin: 'Nǐ jiào shén me míng zi?', arabic: 'ما اسمك؟', english: 'What is your name?' },
    ],
  },
  {
    title_en: 'Pronouns & Basic Phrases',
    title_ar: 'الضمائر والعبارات الأساسية',
    objective_en: 'Learn personal pronouns and basic conversational phrases in Chinese.',
    objective_ar: 'تعلم الضمائر الشخصية والعبارات الأساسية للمحادثة باللغة الصينية.',
    estimated_minutes: 20,
    vocabulary: [
      { chinese: '我', pinyin: 'wǒ', arabic: 'أنا', english: 'I / Me', example: '我是中国人。', exampleAr: 'أنا صيني.', exampleEn: 'I am Chinese.' },
      { chinese: '你', pinyin: 'nǐ', arabic: 'أنت', english: 'You', example: '你是学生吗？', exampleAr: 'هل أنت طالب؟', exampleEn: 'Are you a student?' },
      { chinese: '他', pinyin: 'tā', arabic: 'هو', english: 'He / Him', example: '他是我的老师。', exampleAr: 'هو معلمي.', exampleEn: 'He is my teacher.' },
      { chinese: '她', pinyin: 'tā', arabic: 'هي', english: 'She / Her', example: '她是我的朋友。', exampleAr: 'هي صديقتي.', exampleEn: 'She is my friend.' },
      { chinese: '我们', pinyin: 'wǒ men', arabic: 'نحن', english: 'We / Us', example: '我们一起学习。', exampleAr: 'ندرس معا.', exampleEn: 'We study together.' },
      { chinese: '这', pinyin: 'zhè', arabic: 'هذا', english: 'This', example: '这是我的书。', exampleAr: 'هذا كتابي.', exampleEn: 'This is my book.' },
      { chinese: '那', pinyin: 'nà', arabic: 'ذاك', english: 'That', example: '那是你的笔吗？', exampleAr: 'هل ذلك قلمك؟', exampleEn: 'Is that your pen?' },
      { chinese: '谁', pinyin: 'shuí', arabic: 'من', english: 'Who', example: '他是谁？', exampleAr: 'من هو؟', exampleEn: 'Who is he?' },
    ],
    sentences: [
      { chinese: '你好吗？我很好。', pinyin: 'Nǐ hǎo ma? Wǒ hěn hǎo.', arabic: 'كيف حالك؟ أنا بخير.', english: 'How are you? I am fine.' },
      { chinese: '他是我的朋友。', pinyin: 'Tā shì wǒ de péng you.', arabic: 'هو صديقي.', english: 'He is my friend.' },
      { chinese: '我们一起去学校。', pinyin: 'Wǒ men yī qǐ qù xué xiào.', arabic: 'نذهب إلى المدرسة معا.', english: 'We go to school together.' },
      { chinese: '这是什么？', pinyin: 'Zhè shì shén me?', arabic: 'ما هذا؟', english: 'What is this?' },
    ],
  },
  {
    title_en: 'Food & Drinks',
    title_ar: 'الطعام والمشروبات',
    objective_en: 'Learn common words for food, drinks, and daily meals in Chinese.',
    objective_ar: 'تعلم الكلمات الشائعة للطعام والمشروبات والوجبات اليومية باللغة الصينية.',
    estimated_minutes: 20,
    vocabulary: [
      { chinese: '吃', pinyin: 'chī', arabic: 'يأكل', english: 'Eat', example: '你吃了吗？', exampleAr: 'هل أكلت؟', exampleEn: 'Have you eaten?' },
      { chinese: '喝', pinyin: 'hē', arabic: 'يشرب', english: 'Drink', example: '我喜欢喝咖啡。', exampleAr: 'أحب شرب القهوة.', exampleEn: 'I like drinking coffee.' },
      { chinese: '水', pinyin: 'shuǐ', arabic: 'ماء', english: 'Water', example: '我想喝水。', exampleAr: 'أريد أن أشرب الماء.', exampleEn: 'I want to drink water.' },
      { chinese: '茶', pinyin: 'chá', arabic: 'شاي', english: 'Tea', example: '中国人喜欢喝茶。', exampleAr: 'الصينيون يحبون شرب الشاي.', exampleEn: 'Chinese people like drinking tea.' },
      { chinese: '米饭', pinyin: 'mǐ fàn', arabic: 'أرز', english: 'Rice', example: '我喜欢吃米饭。', exampleAr: 'أحب eating الأرز.', exampleEn: 'I like eating rice.' },
      { chinese: '喜欢', pinyin: 'xǐ huan', arabic: 'يحب', english: 'Like', example: '我喜欢学习汉语。', exampleAr: 'أحب تعلم اللغة الصينية.', exampleEn: 'I like learning Chinese.' },
      { chinese: '苹果', pinyin: 'píng guǒ', arabic: 'تفاح', english: 'Apple', example: '我吃一个苹果。', exampleAr: 'أكلت تفاحة.', exampleEn: 'I eat an apple.' },
      { chinese: '菜', pinyin: 'cài', arabic: 'طبق / خضار', english: 'Dish / Vegetable', example: '这个菜很好吃。', exampleAr: 'هذا الطبق لذيذ جدا.', exampleEn: 'This dish is very delicious.' },
    ],
    sentences: [
      { chinese: '你吃了吗？', pinyin: 'Nǐ chī le ma?', arabic: 'هل أكلت؟', english: 'Have you eaten?' },
      { chinese: '我喜欢喝茶。', pinyin: 'Wǒ xǐ huan hē chá.', arabic: 'أحب شرب الشاي.', english: 'I like drinking tea.' },
      { chinese: '你想吃什么？', pinyin: 'Nǐ xiǎng chī shén me?', arabic: 'ماذا تريد أن تأكل؟', english: 'What do you want to eat?' },
      { chinese: '这个菜很好吃。', pinyin: 'Zhè gè cài hěn hǎo chī.', arabic: 'هذا الطبق لذيذ جدا.', english: 'This dish is very delicious.' },
    ],
  },
  {
    title_en: 'Time & Dates',
    title_ar: 'الوقت والتواريخ',
    objective_en: 'Learn how to tell time, talk about days, and express dates in Chinese.',
    objective_ar: 'تعلم كيفية قول الوقت والتحدث عن الأيام وexpress التواريخ باللغة الصينية.',
    estimated_minutes: 25,
    vocabulary: [
      { chinese: '现在', pinyin: 'xiàn zài', arabic: 'الآن', english: 'Now', example: '现在是三点。', exampleAr: 'الساعة الآن الثالثة.', exampleEn: 'It is three o'clock now.' },
      { chinese: '今天', pinyin: 'jīn tiān', arabic: 'اليوم', english: 'Today', example: '今天是我的生日。', exampleAr: 'اليوم هو عيد ميلادي.', exampleEn: 'Today is my birthday.' },
      { chinese: '明天', pinyin: 'míng tiān', arabic: 'غدا', english: 'Tomorrow', example: '明天我们去学校。', exampleAr: 'غدا نذهب إلى المدرسة.', exampleEn: 'Tomorrow we go to school.' },
      { chinese: '昨天', pinyin: 'zuó tiān', arabic: 'أمس', english: 'Yesterday', example: '昨天我去看电影了。', exampleAr: 'أمس ذهبت لمشاهدة فيلم.', exampleEn: 'Yesterday I went to watch a movie.' },
      { chinese: '年', pinyin: 'nián', arabic: 'سنة', english: 'Year', example: '新年快乐！', exampleAr: 'سنة جديدة سعيدة!', exampleEn: 'Happy New Year!' },
      { chinese: '月', pinyin: 'yuè', arabic: 'شهر / قمر', english: 'Month / Moon', example: '这个月我很忙。', exampleAr: 'أنا مشغول هذا الشهر.', exampleEn: 'I am busy this month.' },
      { chinese: '日', pinyin: 'rì', arabic: 'يوم / شمس', english: 'Day / Sun', example: '今天是星期日。', exampleAr: 'اليوم هو الأحد.', exampleEn: 'Today is Sunday.' },
      { chinese: '星期', pinyin: 'xīng qī', arabic: 'أسبوع', english: 'Week', example: '一星期有七天。', exampleAr: 'الأسبوع يحتوي على سبعة أيام.', exampleEn: 'A week has seven days.' },
      { chinese: '点', pinyin: 'diǎn', arabic: 'الساعة', english: "O'clock", example: '现在八点了。', exampleAr: 'الساعة الثامنة الآن.', exampleEn: 'It is eight o'clock now.' },
    ],
    sentences: [
      { chinese: '现在几点？', pinyin: 'Xiàn zài jǐ diǎn?', arabic: 'كم الساعة الآن؟', english: 'What time is it now?' },
      { chinese: '今天是星期一。', pinyin: 'Jīn tiān shì xīng qī yī.', arabic: 'اليوم هو الاثنين.', english: 'Today is Monday.' },
      { chinese: '明天是我的生日。', pinyin: 'Míng tiān shì wǒ de shēng rì.', arabic: 'غدا هو عيد ميلادي.', english: 'Tomorrow is my birthday.' },
      { chinese: '我每天早上八点起床。', pinyin: 'Wǒ měi tiān zǎo shang bā diǎn qǐ chuáng.', arabic: 'أستيقظ في الثامنة صباحا كل يوم.', english: 'I wake up at eight every morning.' },
    ],
  },
  {
    title_en: 'School & People',
    title_ar: 'المدرسة والناس',
    objective_en: 'Learn vocabulary for school, occupations, and common places.',
    objective_ar: 'تعلم مفردات المدرسة والمهن والأماكن الشائعة.',
    estimated_minutes: 25,
    vocabulary: [
      { chinese: '学校', pinyin: 'xué xiào', arabic: 'مدرسة', english: 'School', example: '我的学校很大。', exampleAr: 'مدرستي كبيرة.', exampleEn: 'My school is big.' },
      { chinese: '老师', pinyin: 'lǎo shī', arabic: 'معلم', english: 'Teacher', example: '我的老师很好。', exampleAr: 'معلمي جيد جدا.', exampleEn: 'My teacher is very good.' },
      { chinese: '学生', pinyin: 'xué sheng', arabic: 'طالب', english: 'Student', example: '我是大学生。', exampleAr: 'أنا طالب جامعي.', exampleEn: 'I am a university student.' },
      { chinese: '同学', pinyin: 'tóng xué', arabic: 'زميل دراسة', english: 'Classmate', example: '他是我的同学。', exampleAr: 'هو زميلي في الدراسة.', exampleEn: 'He is my classmate.' },
      { chinese: '朋友', pinyin: 'péng you', arabic: 'صديق', english: 'Friend', example: '她是我的好朋友。', exampleAr: 'هي صديقتي المقربة.', exampleEn: 'She is my good friend.' },
      { chinese: '医生', pinyin: 'yī shēng', arabic: 'طبيب', english: 'Doctor', example: '我的妈妈是医生。', exampleAr: 'أمي طبيبة.', exampleEn: 'My mother is a doctor.' },
      { chinese: '医院', pinyin: 'yī yuàn', arabic: 'مستشفى', english: 'Hospital', example: '医院离这里很远。', exampleAr: 'المستشفى بعيد عن هنا.', exampleEn: 'The hospital is far from here.' },
      { chinese: '商店', pinyin: 'shāng diàn', arabic: 'محل تجاري', english: 'Shop', example: '我去商店买东西。', exampleAr: 'أذهب للمتجر لشراء الأشياء.', exampleEn: 'I go to the shop to buy things.' },
    ],
    sentences: [
      { chinese: '我是学生，他是老师。', pinyin: 'Wǒ shì xué sheng, tā shì lǎo shī.', arabic: 'أنا طالب، هو معلم.', english: 'I am a student, he is a teacher.' },
      { chinese: '学校在哪里？', pinyin: 'Xué xiào zài nǎ lǐ?', arabic: 'أين المدرسة؟', english: 'Where is the school?' },
      { chinese: '我有很多朋友。', pinyin: 'Wǒ yǒu hěn duō péng you.', arabic: 'لدي الكثير من الأصدقاء.', english: 'I have many friends.' },
      { chinese: '他是我同学。', pinyin: 'Tā shì wǒ tóng xué.', arabic: 'هو زميلي في الدراسة.', english: 'He is my classmate.' },
    ],
  },
  {
    title_en: 'Common Verbs',
    title_ar: 'الأفعال الشائعة',
    objective_en: 'Master essential Chinese verbs for everyday conversations.',
    objective_ar: 'أتقن الأفعال الصينية الأساسية للمحادثات اليومية.',
    estimated_minutes: 20,
    vocabulary: [
      { chinese: '看', pinyin: 'kàn', arabic: 'ينظر / يشاهد', english: 'Look / Watch', example: '我喜欢看电影。', exampleAr: 'أحب مشاهدة الأفلام.', exampleEn: 'I like watching movies.' },
      { chinese: '去', pinyin: 'qù', arabic: 'يذهب', english: 'Go', example: '我去学校。', exampleAr: 'أذهب إلى المدرسة.', exampleEn: 'I go to school.' },
      { chinese: '来', pinyin: 'lái', arabic: 'يأتي', english: 'Come', example: '请来这边。', exampleAr: 'تفضل إلى هنا.', exampleEn: 'Please come this way.' },
      { chinese: '有', pinyin: 'yǒu', arabic: 'لديه / يوجد', english: 'Have / Exist', example: '我有一个问题。', exampleAr: 'لدي سؤال.', exampleEn: 'I have a question.' },
      { chinese: '做', pinyin: 'zuò', arabic: 'يفعل / يصنع', english: 'Do / Make', example: '我在做作业。', exampleAr: 'أقوم بواجباتي.', exampleEn: 'I am doing homework.' },
      { chinese: '买', pinyin: 'mǎi', arabic: 'يشتري', english: 'Buy', example: '我想买一本书。', exampleAr: 'أريد شراء كتاب.', exampleEn: 'I want to buy a book.' },
      { chinese: '打电话', pinyin: 'dǎ diàn huà', arabic: 'يتصل هاتفيا', english: 'Make a phone call', example: '我给妈妈打电话。', exampleAr: 'أتصل بأمي.', exampleEn: 'I call my mother.' },
      { chinese: '认识', pinyin: 'rèn shi', arabic: 'يعرف / يتعرف', english: 'Know / Recognize', example: '很高兴认识你。', exampleAr: 'سعيد بلقائك.', exampleEn: 'Nice to meet you.' },
    ],
    sentences: [
      { chinese: '我去学校学习。', pinyin: 'Wǒ qù xué xiào xué xí.', arabic: 'أذهب إلى المدرسة للدراسة.', english: 'I go to school to study.' },
      { chinese: '你做什么工作？', pinyin: 'Nǐ zuò shén me gōng zuò?', arabic: 'ما هو عملك؟', english: 'What do you do for work?' },
      { chinese: '我想买一本书。', pinyin: 'Wǒ xiǎng mǎi yī běn shū.', arabic: 'أريد شراء كتاب.', english: 'I want to buy a book.' },
      { chinese: '你有时间吗？', pinyin: 'Nǐ yǒu shí jiān ma?', arabic: 'هل لديك وقت؟', english: 'Do you have time?' },
    ],
  },
  {
    title_en: 'Adjectives & Descriptions',
    title_ar: 'الصفات والأوصاف',
    objective_en: 'Learn common adjectives to describe people, places, and things.',
    objective_ar: 'تعلم الصفات الشائعة لوصف الأشخاص والأماكن والأشياء.',
    estimated_minutes: 20,
    vocabulary: [
      { chinese: '高兴', pinyin: 'gāo xìng', arabic: 'سعيد', english: 'Happy', example: '我很高兴认识你。', exampleAr: 'أنا سعيد بمعرفتك.', exampleEn: 'I am happy to meet you.' },
      { chinese: '漂亮', pinyin: 'piào liang', arabic: 'جميل', english: 'Beautiful', example: '这件衣服很漂亮。', exampleAr: 'هذه الملابس جميلة.', exampleEn: 'This piece of clothing is beautiful.' },
      { chinese: '忙', pinyin: 'máng', arabic: 'مشغول', english: 'Busy', example: '我今天很忙。', exampleAr: 'أنا مشغول اليوم.', exampleEn: 'I am very busy today.' },
      { chinese: '冷', pinyin: 'lěng', arabic: 'بارد', english: 'Cold', example: '冬天天气很冷。', exampleAr: 'الطقس بارد في الشتاء.', exampleEn: 'The weather is cold in winter.' },
      { chinese: '热', pinyin: 'rè', arabic: 'حار', english: 'Hot', example: '夏天天气很热。', exampleAr: 'الطقس حار في الصيف.', exampleEn: 'The weather is hot in summer.' },
      { chinese: '大', pinyin: 'dà', arabic: 'كبير', english: 'Big', example: '这是一个大城市。', exampleAr: 'هذه مدينة كبيرة.', exampleEn: 'This is a big city.' },
      { chinese: '小', pinyin: 'xiǎo', arabic: 'صغير', english: 'Small', example: '我住在一个小房子。', exampleAr: 'أعيش في منزل صغير.', exampleEn: 'I live in a small house.' },
      { chinese: '好', pinyin: 'hǎo', arabic: 'جيد', english: 'Good', example: '今天天气很好。', exampleAr: 'الطقس جيد اليوم.', exampleEn: 'The weather is good today.' },
    ],
    sentences: [
      { chinese: '我很高兴。', pinyin: 'Wǒ hěn gāo xìng.', arabic: 'أنا سعيد جدا.', english: 'I am very happy.' },
      { chinese: '这个房子很大。', pinyin: 'Zhè gè fáng zi hěn dà.', arabic: 'هذا المنزل كبير جدا.', english: 'This house is very big.' },
      { chinese: '今天天气很好。', pinyin: 'Jīn tiān tiān qì hěn hǎo.', arabic: 'الطقس جيد اليوم.', english: 'The weather is good today.' },
      { chinese: '他很忙，他很累。', pinyin: 'Tā hěn máng, tā hěn lèi.', arabic: 'هو مشغول جدا، وهو متعب.', english: 'He is very busy, he is very tired.' },
    ],
  },
  {
    title_en: 'Useful Phrases & Review',
    title_ar: 'عبارات مفيدة ومراجعة',
    objective_en: 'Review key vocabulary and learn useful everyday expressions.',
    objective_ar: 'راجع المفردات الرئيسية وتعلم تعبيرات يومية مفيدة.',
    estimated_minutes: 25,
    vocabulary: [
      { chinese: '中国', pinyin: 'zhōng guó', arabic: 'الصين', english: 'China', example: '我是中国人。', exampleAr: 'أنا صيني.', exampleEn: 'I am Chinese.' },
      { chinese: '汉语', pinyin: 'hàn yǔ', arabic: 'اللغة الصينية', english: 'Chinese language', example: '我在学习汉语。', exampleAr: 'أنا أتعلم اللغة الصينية.', exampleEn: 'I am learning Chinese.' },
      { chinese: '名字', pinyin: 'míng zi', arabic: 'اسم', english: 'Name', example: '你叫什么名字？', exampleAr: 'ما اسمك؟', exampleEn: 'What is your name?' },
      { chinese: '书', pinyin: 'shū', arabic: 'كتاب', english: 'Book', example: '这是一本好书。', exampleAr: 'هذا كتاب جيد.', exampleEn: 'This is a good book.' },
      { chinese: '猫', pinyin: 'māo', arabic: 'قطة', english: 'Cat', example: '我喜欢猫。', exampleAr: 'أحب القطط.', exampleEn: 'I like cats.' },
      { chinese: '狗', pinyin: 'gǒu', arabic: 'كلب', english: 'Dog', example: '他有一只狗。', exampleAr: 'لديه كلب.', exampleEn: 'He has a dog.' },
      { chinese: '爱', pinyin: 'ài', arabic: 'يحب', english: 'Love', example: '我爱我的家人。', exampleAr: 'أحب عائلتي.', exampleEn: 'I love my family.' },
      { chinese: '多少钱', pinyin: 'duō shǎo qián', arabic: 'كم سعر هذا', english: 'How much money', example: '这个多少钱？', exampleAr: 'كم سعر هذا؟', exampleEn: 'How much is this?' },
    ],
    sentences: [
      { chinese: '我爱学习汉语。', pinyin: 'Wǒ ài xué xí hàn yǔ.', arabic: 'أحب تعلم اللغة الصينية.', english: 'I love learning Chinese.' },
      { chinese: '你是中国人吗？', pinyin: 'Nǐ shì zhōng guó rén ma?', arabic: 'هل أنت صيني؟', english: 'Are you Chinese?' },
      { chinese: '这个多少钱？', pinyin: 'Zhè gè duō shǎo qián?', arabic: 'كم سعر هذا؟', english: 'How much is this?' },
      { chinese: '我有一个好朋友。', pinyin: 'Wǒ yǒu yī gè hǎo péng you.', arabic: 'لدي صديق جيد.', english: 'I have a good friend.' },
    ],
  },
];

// ============================================================
// PDF TEXT EXTRACTION
// ============================================================

async function extractTextFromPdf(pdfBuffer: Uint8Array): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: { str?: string }) => item.str || '')
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json() as { pdfId: string };
    const { pdfId } = body;

    if (!pdfId) {
      return new Response(
        JSON.stringify({ error: 'Missing pdfId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Fetch the PDF record
    const { data: pdfRecord, error: pdfError } = await supabaseAdmin
      .from('pdf_uploads')
      .select('*')
      .eq('id', pdfId)
      .single();

    if (pdfError || !pdfRecord) {
      return new Response(
        JSON.stringify({ error: 'PDF record not found', details: pdfError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Update status to 'processing'
    await supabaseAdmin
      .from('pdf_uploads')
      .update({
        extraction_status: 'processing',
        extracted_data: { started_at: new Date().toISOString() },
      })
      .eq('id', pdfId);

    // 3. Download the PDF from Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('pdf-uploads')
      .download(pdfRecord.storage_path);

    if (downloadError || !fileData) {
      await supabaseAdmin
        .from('pdf_uploads')
        .update({
          extraction_status: 'failed',
          extracted_data: {
            error: 'Failed to download PDF from storage',
            details: downloadError?.message,
          },
        })
        .eq('id', pdfId);

      return new Response(
        JSON.stringify({ error: 'Failed to download PDF', details: downloadError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Convert to Uint8Array and extract text
    const arrayBuffer = await fileData.arrayBuffer();
    const pdfBuffer = new Uint8Array(arrayBuffer);

    let extractedText: string;
    try {
      extractedText = await extractTextFromPdf(pdfBuffer);
    } catch {
      // If PDF extraction fails (e.g., scanned PDF), use filename for context
      extractedText = `HSK Textbook: ${pdfRecord.file_name}`;
    }

    // 5. Find or create the HSK 1 level
    const { data: existingLevel } = await supabaseAdmin
      .from('levels')
      .select('id')
      .eq('order_num', 1)
      .maybeSingle();

    let levelId: string;
    let levelCreated = false;

    if (existingLevel) {
      levelId = existingLevel.id;
    } else {
      const { data: newLevel, error: levelError } = await supabaseAdmin
        .from('levels')
        .insert({
          order_num: 1,
          title_en: 'Chinese Basics',
          title_ar: 'أساسيات الصينية',
          description_en: 'Generated from HSK 1 textbook PDF',
          description_ar: 'تم إنشاؤه من كتاب HSK 1',
          estimated_hours: 4,
          is_premium: false,
        })
        .select()
        .single();

      if (levelError) throw levelError;
      levelId = newLevel.id;
      levelCreated = true;
    }

    // 6. Generate lessons with draft status
    let totalLessons = 0;
    let totalVocabulary = 0;
    let totalSentences = 0;
    let totalQuestions = 0;
    const processingNotes: string[] = [];

    if (levelCreated) {
      processingNotes.push('Created new level: Chinese Basics (HSK 1)');
    } else {
      processingNotes.push('Using existing level: Chinese Basics (HSK 1)');
    }

    // Insert each lesson template as a draft
    for (let i = 0; i < HSK1_LESSONS.length; i++) {
      const lessonTemplate = HSK1_LESSONS[i];

      // Check if a lesson with this order_num already exists for this level
      const { data: existingLesson } = await supabaseAdmin
        .from('lessons')
        .select('id')
        .eq('level_id', levelId)
        .eq('order_num', i + 1)
        .maybeSingle();

      if (existingLesson) {
        processingNotes.push(`Skipped lesson ${i + 1} (already exists): ${lessonTemplate.title_en}`);
        continue;
      }

      // Create the lesson as draft
      const { data: lessonRecord, error: lessonError } = await supabaseAdmin
        .from('lessons')
        .insert({
          level_id: levelId,
          order_num: i + 1,
          title_en: lessonTemplate.title_en,
          title_ar: lessonTemplate.title_ar,
          objective_en: lessonTemplate.objective_en,
          objective_ar: lessonTemplate.objective_ar,
          status: 'draft',
          estimated_minutes: lessonTemplate.estimated_minutes,
        })
        .select()
        .single();

      if (lessonError) {
        processingNotes.push(`Error creating lesson "${lessonTemplate.title_en}": ${lessonError.message}`);
        continue;
      }

      totalLessons++;
      const lessonId = lessonRecord.id;

      // Insert vocabulary
      for (let vIdx = 0; vIdx < lessonTemplate.vocabulary.length; vIdx++) {
        const vocab = lessonTemplate.vocabulary[vIdx];
        const { error: vocabError } = await supabaseAdmin
          .from('vocabulary')
          .insert({
            lesson_id: lessonId,
            chinese: vocab.chinese,
            pinyin: vocab.pinyin,
            arabic: vocab.arabic,
            english: vocab.english,
            order_num: vIdx + 1,
          });

        if (!vocabError) totalVocabulary++;
      }

      // Insert sentences
      for (let sIdx = 0; sIdx < lessonTemplate.sentences.length; sIdx++) {
        const sentence = lessonTemplate.sentences[sIdx];
        const { error: sentenceError } = await supabaseAdmin
          .from('sentences')
          .insert({
            lesson_id: lessonId,
            chinese: sentence.chinese,
            pinyin: sentence.pinyin,
            arabic: sentence.arabic,
            english: sentence.english,
            order_num: sIdx + 1,
          });

        if (!sentenceError) totalSentences++;
      }

      // Generate quiz questions from vocabulary
      const quizVocab = lessonTemplate.vocabulary.slice(0, 4);
      for (let qIdx = 0; qIdx < quizVocab.length; qIdx++) {
        const correct = quizVocab[qIdx];
        const wrongOptions = lessonTemplate.vocabulary
          .filter((_, idx) => idx !== qIdx)
          .slice(0, 3)
          .map(v => ({ id: String.fromCharCode(98 + ((qIdx + idx) % 3)), textEn: v.english, textAr: v.arabic }));

        const allOptions = [
          { id: 'a', textEn: correct.english, textAr: correct.arabic },
          ...wrongOptions.map((o, idx) => ({ id: String.fromCharCode(98 + idx), textEn: o.textEn, textAr: o.textAr })),
        ];

        const { error: quizError } = await supabaseAdmin
          .from('quiz_questions')
          .insert({
            lesson_id: lessonId,
            question_en: `What does "${correct.chinese}" (${correct.pinyin}) mean?`,
            question_ar: `ما معنى "${correct.chinese}" (${correct.pinyin})؟`,
            question_type: 'multiple_choice',
            options: allOptions,
            correct_option_id: 'a',
            order_num: qIdx + 1,
          });

        if (!quizError) totalQuestions++;
      }

      processingNotes.push(`Created lesson ${i + 1}: ${lessonTemplate.title_en} (${lessonTemplate.vocabulary.length} vocab, ${lessonTemplate.sentences.length} sentences)`);
    }

    // 7. Update pdf_uploads with success status
    const extractedData = {
      extracted_text_summary: extractedText.substring(0, 2000),
      detected_level: 'HSK 1',
      raw_characters_found: extractedText.match(/[\u4e00-\u9fff]/g)?.length || 0,
      generated_levels_count: levelCreated ? 1 : 0,
      generated_lessons_count: totalLessons,
      generated_vocabulary_count: totalVocabulary,
      generated_sentences_count: totalSentences,
      generated_questions_count: totalQuestions,
      processing_notes: processingNotes,
      completed_at: new Date().toISOString(),
      source_file: pdfRecord.file_name,
    };

    await supabaseAdmin
      .from('pdf_uploads')
      .update({
        extraction_status: 'completed',
        extracted_data: extractedData,
      })
      .eq('id', pdfId);

    return new Response(
      JSON.stringify({
        success: true,
        pdfId,
        results: {
          extractedTextLength: extractedText.length,
          detectedLevel: 'HSK 1',
          levelsGenerated: levelCreated ? 1 : 0,
          lessonsGenerated: totalLessons,
          vocabularyGenerated: totalVocabulary,
          sentencesGenerated: totalSentences,
          questionsGenerated: totalQuestions,
          processingNotes,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Process PDF error:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
