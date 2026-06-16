// V3.2 — HSK3 PRACTICE SIMULATION. Original training questions in the style of
// HSK3 (NOT an official exam). All items are original and built around the
// HSK2/HSK3 vocabulary already in the NiHao dictionary, so there is no overlap
// with the HSK1 simulation (hsk1sim.ts). 20 listening (TTS) + 20 reading.
export interface Hsk3Q {
  part: 'listening' | 'reading';
  audio?: string;
  q_ar: string; q_en: string;
  chinese?: string;
  options: string[];
  correct: string;
  pinyin?: string;
}

const L = (audio: string, q_ar: string, q_en: string, options: string[], correct: string, pinyin?: string): Hsk3Q =>
  ({ part: 'listening', audio, q_ar, q_en, options, correct, pinyin });
const R = (q_ar: string, q_en: string, chinese: string | undefined, options: string[], correct: string, pinyin?: string): Hsk3Q =>
  ({ part: 'reading', q_ar, q_en, chinese, options, correct, pinyin });

export const HSK3_QUESTIONS: Hsk3Q[] = [
  // ---------- LISTENING (20) ----------
  L('我打算去旅游', 'ماذا ينوي المتحدث؟', 'What does the speaker plan to do?', ['السفر', 'النوم', 'العمل'], 'السفر', 'wǒ dǎsuàn qù lǚyóu'),
  L('请帮我打扫房间', 'بماذا طُلب المساعدة؟', 'Help with what?', ['تنظيف الغرفة', 'طبخ الطعام', 'غسل الملابس'], 'تنظيف الغرفة', 'qǐng bāng wǒ dǎsǎo fángjiān'),
  L('附近有一个超市', 'ماذا يوجد بالقرب؟', 'What is nearby?', ['سوبر ماركت', 'مستشفى', 'مدرسة'], 'سوبر ماركت', 'fùjìn yǒu yí ge chāoshì'),
  L('他迟到了', 'ماذا حدث؟', 'What happened?', ['تأخّر', 'مرض', 'نام'], 'تأخّر', 'tā chídào le'),
  L('我觉得很简单', 'كيف يراها المتحدث؟', "Speaker's opinion?", ['بسيطة', 'صعبة', 'مملّة'], 'بسيطة', 'wǒ juéde hěn jiǎndān'),
  L('请注意安全', 'ماذا يُطلب؟', 'What is asked?', ['الانتباه للسلامة', 'الإسراع', 'الهدوء'], 'الانتباه للسلامة', 'qǐng zhùyì ānquán'),
  L('我需要帮助', 'ماذا يحتاج؟', 'What does he need?', ['مساعدة', 'وقت', 'مال'], 'مساعدة', 'wǒ xūyào bāngzhù'),
  L('天突然下雨了', 'ماذا حدث فجأة؟', 'What happened suddenly?', ['أمطرت', 'هبّت الريح', 'أشمست'], 'أمطرت', 'tiān tūrán xià yǔ le'),
  L('这个周末去爬山', 'ماذا سيفعل في العطلة؟', 'Weekend plan?', ['تسلّق الجبل', 'السباحة', 'القراءة'], 'تسلّق الجبل', 'zhège zhōumò qù páshān'),
  L('我最近很忙', 'كيف حال المتحدث مؤخراً؟', 'How has he been lately?', ['مشغول', 'مريض', 'سعيد'], 'مشغول', 'wǒ zuìjìn hěn máng'),
  L('请把门关上', 'ماذا طُلب؟', 'What was requested?', ['إغلاق الباب', 'فتح النافذة', 'إطفاء الضوء'], 'إغلاق الباب', 'qǐng bǎ mén guānshàng'),
  L('我相信你', 'ماذا قال المتحدث؟', 'What did he say?', ['أثق بك', 'أعرفك', 'أساعدك'], 'أثق بك', 'wǒ xiāngxìn nǐ'),
  L('图书馆在三楼', 'أين المكتبة؟', 'Where is the library?', ['الطابق الثالث', 'الطابق الأول', 'الطابق الثاني'], 'الطابق الثالث', 'túshūguǎn zài sān lóu'),
  L('他终于来了', 'متى وصل؟', 'When did he arrive?', ['أخيراً', 'مبكراً', 'متأخراً'], 'أخيراً', 'tā zhōngyú lái le'),
  L('我担心考试', 'مِمّ يقلق؟', 'What is he worried about?', ['الامتحان', 'الطقس', 'الرحلة'], 'الامتحان', 'wǒ dānxīn kǎoshì'),
  L('这件事很重要', 'كيف يصف الأمر؟', 'How is the matter described?', ['مهم', 'بسيط', 'غريب'], 'مهم', 'zhè jiàn shì hěn zhòngyào'),
  L('请帮我检查一下', 'ماذا يطلب؟', 'What does he ask?', ['الفحص', 'الترجمة', 'الإعادة'], 'الفحص', 'qǐng bāng wǒ jiǎnchá yíxià'),
  L('我们一边走一边聊', 'ماذا يفعلون؟', 'What are they doing?', ['يمشون ويتحدثون', 'يأكلون', 'يدرسون'], 'يمشون ويتحدثون', 'wǒmen yìbiān zǒu yìbiān liáo'),
  L('他的成绩很好', 'كيف نتيجته؟', 'How is his grade?', ['جيدة', 'سيئة', 'عادية'], 'جيدة', 'tā de chéngjì hěn hǎo'),
  L('外面在刮风', 'كيف الطقس بالخارج؟', 'Weather outside?', ['رياح', 'مطر', 'ثلج'], 'رياح', 'wàimiàn zài guāfēng'),
  // ---------- READING (20) ----------
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '环境', ['بيئة / environment', 'ثقافة / culture', 'تاريخ / history'], 'بيئة / environment', 'huánjìng'),
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '健康', ['صحة / health', 'سعادة / happiness', 'نجاح / success'], 'صحة / health', 'jiànkāng'),
  R('ما معنى هذه الكلمة؟', 'What does this mean?', '经理', ['مدير / manager', 'معلم / teacher', 'سائق / driver'], 'مدير / manager', 'jīnglǐ'),
  R('اختر البينين الصحيح:', 'Choose the correct Pinyin:', '图书馆', ['túshūguǎn', 'túshūguàn', 'túshūguǎn'], 'túshūguǎn'),
  R('اختر البينين الصحيح:', 'Choose the correct Pinyin:', '自行车', ['zìxíngchē', 'zìxíngché', 'zìhángchē'], 'zìxíngchē'),
  R('أكمل الجملة: 我要去___借书。', 'Complete: I want to go to ___ to borrow books.', undefined, ['图书馆', '超市', '机场'], '图书馆', 'túshūguǎn'),
  R('أكمل الجملة: 今天天气很好，我们去___吧。', 'Complete: nice weather, let’s go to the ___.', undefined, ['公园', '医院', '银行'], '公园', 'gōngyuán'),
  R('أي كلمة عكس 简单؟', 'Which is the opposite of 简单 (simple)?', undefined, ['复杂/难', '容易', '清楚'], '复杂/难', 'nán'),
  R('أي كلمة عكس 高兴؟', 'Opposite of 高兴 (happy)?', undefined, ['难过', '满意', '热情'], '难过', 'nánguò'),
  R('ما معنى 周末؟', 'What does 周末 mean?', '周末', ['عطلة نهاية الأسبوع', 'بداية الأسبوع', 'يوم الإجازة الرسمية'], 'عطلة نهاية الأسبوع', 'zhōumò'),
  R('اختر الكلمة المناسبة: 我每天___锻炼身体。', 'Choose: I exercise every day.', undefined, ['努力', '马上', '一直'], '努力', 'nǔlì'),
  R('ما معنى الجملة 我同意你？', 'Meaning of 我同意你?', '我同意你', ['أوافقك', 'أعرفك', 'أنتظرك'], 'أوافقك', 'wǒ tóngyì nǐ'),
  R('ما معنى 关系؟', 'What does 关系 mean?', '关系', ['علاقة', 'مشكلة', 'فرصة'], 'علاقة', 'guānxi'),
  R('اختر المصنّف الصحيح: 一___车', 'Choose the measure word: one ___ car', undefined, ['辆', '张', '条'], '辆', 'liàng'),
  R('اختر المصنّف الصحيح: 一___纸', 'Choose the measure word: one ___ (sheet of) paper', undefined, ['张', '辆', '位'], '张', 'zhāng'),
  R('ما معنى 终于؟', 'What does 终于 mean?', '终于', ['أخيراً', 'فجأة', 'دائماً'], 'أخيراً', 'zhōngyú'),
  R('أكمل: 如果明天下雨，我就不___。', 'Complete: If it rains tomorrow, I won’t ___.', undefined, ['去', '来', '是'], '去', 'qù'),
  R('ما معنى 提高水平؟', 'Meaning of 提高水平?', '提高水平', ['رفع المستوى', 'خفض السعر', 'تغيير الخطة'], 'رفع المستوى', 'tígāo shuǐpíng'),
  R('ما معنى 照顾؟', 'What does 照顾 mean?', '照顾', ['يعتني بـ', 'يلتقط صورة', 'يقارن'], 'يعتني بـ', 'zhàogù'),
  R('أي جملة صحيحة نحوياً؟', 'Which sentence is grammatically correct?', undefined, ['我把书放在桌子上', '我书把桌子上放', '把我书放桌子上'], '我把书放在桌子上', 'wǒ bǎ shū fàng zài zhuōzi shàng'),
];

export const HSK3_PASS_PCT = 60;
export const HSK3_TIME_MINUTES = 25;
