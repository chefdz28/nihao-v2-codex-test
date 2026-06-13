// V2.2.1 HSK1 PRACTICE SIMULATION — original training questions in the style
// of HSK1 (NOT an official exam). 20 listening (TTS) + 20 reading.

export interface HskQ {
  part: 'listening' | 'reading';
  audio?: string;          // chinese text spoken via TTS (listening part)
  q_ar: string; q_en: string;
  chinese?: string;        // shown text (reading part)
  options: string[];
  correct: string;
  pinyin?: string;
}

const L = (audio: string, q_ar: string, q_en: string, options: string[], correct: string, pinyin?: string): HskQ =>
  ({ part: 'listening', audio, q_ar, q_en, options, correct, pinyin });
const R = (q_ar: string, q_en: string, chinese: string | undefined, options: string[], correct: string, pinyin?: string): HskQ =>
  ({ part: 'reading', q_ar, q_en, chinese, options, correct, pinyin });

export const HSK1_QUESTIONS: HskQ[] = [
  // ---------- LISTENING (20) ----------
  L('你好', 'ماذا سمعت؟', 'What did you hear?', ['你好', '再见', '谢谢'], '你好', 'nǐ hǎo'),
  L('谢谢', 'ماذا سمعت؟', 'What did you hear?', ['谢谢', '不客气', '请坐'], '谢谢', 'xièxie'),
  L('再见', 'ماذا سمعت؟', 'What did you hear?', ['再见', '你好', '没关系'], '再见', 'zàijiàn'),
  L('三', 'أي رقم سمعت؟', 'Which number?', ['3', '4', '10'], '3', 'sān'),
  L('七', 'أي رقم سمعت؟', 'Which number?', ['7', '1', '9'], '7', 'qī'),
  L('十五', 'أي رقم سمعت؟', 'Which number?', ['15', '50', '5'], '15', 'shíwǔ'),
  L('四十', 'أي رقم سمعت؟', 'Which number?', ['40', '14', '44'], '40', 'sìshí'),
  L('妈', 'أي نغمة سمعت؟', 'Which tone?', ['الأولى / 1st', 'الثالثة / 3rd', 'الرابعة / 4th'], 'الأولى / 1st', 'mā'),
  L('马', 'أي نغمة سمعت؟', 'Which tone?', ['الثالثة / 3rd', 'الأولى / 1st', 'الثانية / 2nd'], 'الثالثة / 3rd', 'mǎ'),
  L('我是学生', 'ماذا تعني الجملة؟', 'What does it mean?', ['أنا طالب', 'أنا معلم', 'أنا صيني'], 'أنا طالب', 'wǒ shì xuésheng'),
  L('我想喝茶', 'ماذا يريد المتحدث؟', 'What does the speaker want?', ['شرب الشاي', 'شرب الماء', 'الأكل'], 'شرب الشاي', 'wǒ xiǎng hē chá'),
  L('今天很热', 'كيف الطقس؟', 'How is the weather?', ['حار', 'بارد', 'جميل'], 'حار', 'jīntiān hěn rè'),
  L('他是我的老师', 'من هو؟', 'Who is he?', ['معلمي', 'صديقي', 'أبي'], 'معلمي', 'tā shì wǒ de lǎoshī'),
  L('我去学校', 'إلى أين يذهب؟', 'Where is he going?', ['المدرسة', 'المطعم', 'المتجر'], 'المدرسة', 'wǒ qù xuéxiào'),
  L('多少钱', 'ماذا يسأل؟', 'What is being asked?', ['عن السعر', 'عن الوقت', 'عن الاسم'], 'عن السعر', 'duōshao qián'),
  L('现在三点', 'كم الساعة؟', 'What time is it?', ['الثالثة', 'الثانية', 'الثالثة عشرة'], 'الثالثة', 'xiànzài sān diǎn'),
  L('星期一', 'أي يوم؟', 'Which day?', ['الاثنين', 'الأحد', 'السبت'], 'الاثنين', 'xīngqīyī'),
  L('我有两个朋友', 'كم صديقاً عنده؟', 'How many friends?', ['اثنان', 'ثلاثة', 'واحد'], 'اثنان', 'wǒ yǒu liǎng gè péngyou'),
  L('请坐', 'ماذا قيل لك؟', 'What were you told?', ['تفضل بالجلوس', 'مع السلامة', 'عفواً'], 'تفضل بالجلوس', 'qǐng zuò'),
  L('我不是老师', 'ماذا قال المتحدث؟', 'What did they say?', ['لستُ معلماً', 'أنا معلم', 'لست طالباً'], 'لستُ معلماً', 'wǒ bú shì lǎoshī'),
  // ---------- READING (20) ----------
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '水', ['ماء / water', 'نار / fire', 'شاي / tea'], 'ماء / water', 'shuǐ'),
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '人', ['إنسان / person', 'يدخل / enter', 'كبير / big'], 'إنسان / person', 'rén'),
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '中国', ['الصين / China', 'الصينية / Chinese language', 'بكين / Beijing'], 'الصين / China', 'zhōngguó'),
  R('اختر البينين الصحيح:', 'Choose the correct Pinyin:', '学生', ['xuésheng', 'lǎoshī', 'xuéxiào'], 'xuésheng'),
  R('اختر البينين الصحيح:', 'Choose the correct Pinyin:', '朋友', ['péngyou', 'míngzi', 'fànguǎn'], 'péngyou'),
  R('اختر البينين الصحيح:', 'Choose the correct Pinyin:', '谢谢', ['xièxie', 'zàijiàn', 'nǐ hǎo'], 'xièxie'),
  R('الرقم 二十五 هو:', '二十五 is:', '二十五', ['25', '52', '205'], '25', 'èrshíwǔ'),
  R('الرقم 九十九 هو:', '九十九 is:', '九十九', ['99', '19', '909'], '99', 'jiǔshíjiǔ'),
  R('أكمل: 我___学生。', 'Complete: 我___学生。', '我___学生。', ['是', '很', '去'], '是', 'wǒ shì xuésheng'),
  R('أكمل: 你___茶吗？', 'Complete: 你___茶吗？', '你___茶吗？', ['喝', '吃', '看'], '喝', 'nǐ hē chá ma?'),
  R('أكمل: 他___饭馆工作。', 'Complete: 他___饭馆工作。', '他___饭馆工作。', ['在', '是', '的'], '在', 'tā zài fànguǎn gōngzuò'),
  R('حوّل لسؤال: 你是老师 ←', 'Make a question: 你是老师 →', '你是老师', ['你是老师吗？', '吗你是老师？', '你是吗老师？'], '你是老师吗？', 'nǐ shì lǎoshī ma?'),
  R('انفِ الجملة: 我有猫 ←', 'Negate: 我有猫 →', '我有猫', ['我没有猫', '我不有猫', '没我有猫'], '我没有猫', 'wǒ méiyǒu māo'),
  R('رتب الجملة الصحيحة:', 'Choose the correct order:', undefined, ['我去中国', '中国去我', '去我中国'], '我去中国', 'wǒ qù zhōngguó'),
  R('رتب الجملة الصحيحة:', 'Choose the correct order:', undefined, ['今天天气很好', '天气今天很好', '很好今天天气'], '今天天气很好', 'jīntiān tiānqì hěn hǎo'),
  R('"كوب شاي" بالصينية:', '"A cup of tea":', undefined, ['一杯茶', '一个茶', '一本茶'], '一杯茶', 'yì bēi chá'),
  R('ما معنى 星期天؟', 'What is 星期天?', '星期天', ['الأحد / Sunday', 'السبت / Saturday', 'الاثنين / Monday'], 'الأحد / Sunday', 'xīngqītiān'),
  R('六月 هو شهر:', '六月 is:', '六月', ['يونيو / June', 'أغسطس / August', 'السادس عشر / 16th'], 'يونيو / June', 'liù yuè'),
  R('"لو سمحت / اسمح لي بالسؤال":', '"Excuse me, may I ask":', undefined, ['请问', '不客气', '没关系'], '请问', 'qǐngwèn'),
  R('ما معنى 我们都是学生؟', 'Meaning of 我们都是学生:', '我们都是学生', ['كلنا طلاب', 'نحن لسنا طلاباً', 'بعضنا طلاب'], 'كلنا طلاب', 'wǒmen dōu shì xuésheng'),
];

export const HSK1_PASS_PCT = 60;
export const HSK1_TIME_MINUTES = 25;
