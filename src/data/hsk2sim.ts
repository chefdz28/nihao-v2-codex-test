// V3.3 — HSK2 PRACTICE SIMULATION. Original training questions in the style of
// HSK2 (NOT an official exam), built around HSK2 vocabulary already in the NiHao
// dictionary. Verified to not overlap with the HSK1 or HSK3 simulations. Mixed
// types: multiple choice, meaning match, pinyin recognition, sentence
// completion, and listening-style text prompts. 18 listening (TTS) + 18 reading.
export interface Hsk2Q {
  part: 'listening' | 'reading';
  audio?: string;
  q_ar: string; q_en: string;
  chinese?: string;
  options: string[];
  correct: string;
  pinyin?: string;
}

const L = (audio: string, q_ar: string, q_en: string, options: string[], correct: string, pinyin?: string): Hsk2Q =>
  ({ part: 'listening', audio, q_ar, q_en, options, correct, pinyin });
const R = (q_ar: string, q_en: string, chinese: string | undefined, options: string[], correct: string, pinyin?: string): Hsk2Q =>
  ({ part: 'reading', q_ar, q_en, chinese, options, correct, pinyin });

export const HSK2_QUESTIONS: Hsk2Q[] = [
  // ---------- LISTENING (18) ----------
  L('我很忙', 'كيف حال المتحدث؟', 'How is the speaker?', ['مشغول', 'متعب', 'سعيد'], 'مشغول', 'wǒ hěn máng'),
  L('今天太热了', 'كيف الطقس؟', 'How is the weather?', ['حار جداً', 'بارد', 'ممطر'], 'حار جداً', 'jīntiān tài rè le'),
  L('我想休息一下', 'ماذا يريد؟', 'What does he want?', ['أن يستريح', 'أن يأكل', 'أن يعمل'], 'أن يستريح', 'wǒ xiǎng xiūxi yíxià'),
  L('这个很便宜', 'كيف السعر؟', 'How is the price?', ['رخيص', 'غالٍ', 'مرتفع'], 'رخيص', 'zhège hěn piányi'),
  L('我每天跑步', 'ماذا يفعل كل يوم؟', 'What does he do daily?', ['يركض', 'يسبح', 'ينام'], 'يركض', 'wǒ měitiān pǎobù'),
  L('请给我一杯咖啡', 'ماذا يطلب؟', 'What does he order?', ['قهوة', 'شاي', 'ماء'], 'قهوة', 'qǐng gěi wǒ yì bēi kāfēi'),
  L('我的房间很干净', 'كيف غرفته؟', 'How is his room?', ['نظيفة', 'كبيرة', 'صغيرة'], 'نظيفة', 'wǒ de fángjiān hěn gānjìng'),
  L('他正在上班', 'ماذا يفعل الآن؟', 'What is he doing now?', ['في العمل', 'في البيت', 'في السفر'], 'في العمل', 'tā zhèngzài shàngbān'),
  L('我妹妹很漂亮', 'من الجميلة؟', 'Who is pretty?', ['أخته الصغرى', 'أمه', 'صديقته'], 'أخته الصغرى', 'wǒ mèimei hěn piàoliang'),
  L('外面在下雪', 'كيف الطقس بالخارج؟', 'Weather outside?', ['ثلج', 'مطر', 'شمس'], 'ثلج', 'wàimiàn zài xià xuě'),
  L('我已经吃饭了', 'ماذا فعل؟', 'What did he do?', ['أكل بالفعل', 'لم يأكل', 'سيأكل'], 'أكل بالفعل', 'wǒ yǐjīng chīfàn le'),
  L('火车站离这儿很近', 'أين محطة القطار؟', 'Where is the station?', ['قريبة', 'بعيدة', 'مغلقة'], 'قريبة', 'huǒchēzhàn lí zhèr hěn jìn'),
  L('我要去机场', 'إلى أين يذهب؟', 'Where is he going?', ['المطار', 'المدرسة', 'البنك'], 'المطار', 'wǒ yào qù jīchǎng'),
  L('今天是我的生日', 'ما المناسبة؟', 'What is the occasion?', ['عيد ميلاده', 'عطلة', 'امتحان'], 'عيد ميلاده', 'jīntiān shì wǒ de shēngrì'),
  L('我喜欢踢足球', 'ماذا يحب؟', 'What does he like?', ['كرة القدم', 'كرة السلة', 'السباحة'], 'كرة القدم', 'wǒ xǐhuān tī zúqiú'),
  L('请慢一点', 'ماذا يطلب؟', 'What is requested?', ['التمهّل', 'الإسراع', 'التوقف'], 'التمهّل', 'qǐng màn yìdiǎn'),
  L('我身体不舒服', 'كيف حاله؟', 'How does he feel?', ['متوعّك', 'بصحة جيدة', 'سعيد'], 'متوعّك', 'wǒ shēntǐ bù shūfu'),
  L('我们一起去吧', 'ماذا يقترح؟', 'What does he suggest?', ['الذهاب معاً', 'البقاء', 'الانتظار'], 'الذهاب معاً', 'wǒmen yìqǐ qù ba'),
  // ---------- READING (18) ----------
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '时间', ['وقت / time', 'مكان / place', 'مال / money'], 'وقت / time', 'shíjiān'),
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '问题', ['سؤال/مشكلة', 'جواب', 'فكرة'], 'سؤال/مشكلة', 'wèntí'),
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '颜色', ['لون / color', 'رقم / number', 'شكل / shape'], 'لون / color', 'yánsè'),
  R('اختر البينين الصحيح:', 'Choose the correct Pinyin:', 'started 开始', ['kāishǐ', 'kāishī', 'kāisǐ'], 'kāishǐ'),
  R('اختر البينين الصحيح:', 'Choose the correct Pinyin:', '休息', ['xiūxi', 'xiūxī', 'xiùxi'], 'xiūxi'),
  R('أكمل: 因为下雨，___我没去。', 'Complete: Because it rained, ___ I didn’t go.', undefined, ['所以', '但是', '可是'], '所以', 'suǒyǐ'),
  R('أكمل: 我___喝茶。', 'Complete: I ___ to drink tea.', undefined, ['想', '是', '在'], '想', 'xiǎng'),
  R('أي كلمة عكس 快؟', 'Opposite of 快 (fast)?', undefined, ['慢', '高', '新'], '慢', 'màn'),
  R('أي كلمة عكس 贵؟', 'Opposite of 贵 (expensive)?', undefined, ['便宜', '远', '累'], '便宜', 'piányi'),
  R('ما معنى 已经؟', 'What does 已经 mean?', '已经', ['بالفعل', 'ربما', 'دائماً'], 'بالفعل', 'yǐjīng'),
  R('اختر المناسب: 我每天___汉语。', 'Choose: I ___ Chinese every day.', undefined, ['学习', '旅游', '帮助'], '学习', 'xuéxí'),
  R('ما معنى الجملة 我觉得很好؟', 'Meaning of 我觉得很好?', '我觉得很好', ['أعتقد أنه جيد', 'لا أعرف', 'أنا مشغول'], 'أعتقد أنه جيد', 'wǒ juéde hěn hǎo'),
  R('ما معنى 旅游؟', 'What does 旅游 mean?', '旅游', ['سياحة/سفر', 'دراسة', 'عمل'], 'سياحة/سفر', 'lǚyóu'),
  R('اختر العدّاد الصحيح: 一___衣服', 'Choose measure word: one ___ of clothing', undefined, ['件', '个', '本'], '件', 'jiàn'),
  R('أكمل: 你___去？', 'Complete: ___ are you going? (why)', undefined, ['为什么', '什么', '怎么'], '为什么', 'wèishénme'),
  R('ما معنى 准备؟', 'What does 准备 mean?', '准备', ['يستعد', 'ينام', 'يبيع'], 'يستعد', 'zhǔnbèi'),
  R('أي جملة صحيحة؟', 'Which sentence is correct?', undefined, ['我已经到了', '我到已经了', '已经我到了'], '我已经到了', 'wǒ yǐjīng dào le'),
  R('ما معنى 希望؟', 'What does 希望 mean?', '希望', ['يأمل', 'يخاف', 'يغضب'], 'يأمل', 'xīwàng'),
];

export const HSK2_PASS_PCT = 60;
export const HSK2_TIME_MINUTES = 20;
