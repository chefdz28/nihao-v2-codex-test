// V2.0.3 fallback grammar content for lessons 1–15, keyed by lesson order_num.
// Used automatically when the optional grammar tables are missing or empty,
// so the Grammar tab works out-of-the-box. Once rows exist in Supabase
// (grammar_points / grammar_exercises), the database wins.
import type { GrammarPoint, GrammarExercise } from '@/types/grammar';

type LessonGrammarData = { points: GrammarPoint[]; exercises: GrammarExercise[] };

const P = (p: Omit<GrammarPoint, 'lesson_id'>): GrammarPoint => ({ ...p, lesson_id: null });
const E = (e: Omit<GrammarExercise, 'lesson_id' | 'grammar_point_id'>): GrammarExercise => ({ ...e, lesson_id: null, grammar_point_id: null });

export const grammarFallback: Record<number, LessonGrammarData> = {
  // ============ Lesson 1: 你好 Hello ============
  1: {
    points: [
      P({
        id: 'g1-1', order_num: 1,
        title_en: '你 vs 您 — casual vs respectful "you"',
        title_ar: '你 مقابل 您 — "أنتَ" العادية مقابل الاحترامية',
        pattern: '你 (nǐ) → friends · 您 (nín) → respect',
        explanation_en: 'Chinese has two words for "you". 你 (nǐ) is the everyday form used with friends, family and people your age. 您 (nín) is the respectful form — notice it is 你 with 心 (heart) underneath: you put your heart into respecting the person.',
        explanation_ar: 'في الصينية كلمتان لـ"أنت": 你 (nǐ) هي الصيغة اليومية مع الأصدقاء والعائلة ومن في عمرك، و您 (nín) هي صيغة الاحترام — لاحظ أنها 你 وتحتها 心 (قلب): كأنك تضع قلبك في احترام الشخص.',
        usage_en: 'Use 您 with teachers, elders, customers, bosses, and strangers older than you. Use 你 with friends, classmates, children, and family of similar age.',
        usage_ar: 'استخدم 您 مع المعلمين وكبار السن والعملاء والمدراء والغرباء الأكبر منك. واستخدم 你 مع الأصدقاء وزملاء الدراسة والأطفال والأقارب من عمرك.',
        formal_note_en: 'Formal: 您 — Casual: 你. When unsure with adults you just met, 您 is the safe choice; nobody is offended by extra respect.',
        formal_note_ar: 'رسمي: 您 — عادي: 你. إذا لم تكن متأكداً مع بالغين قابلتهم للتو، فـ您 هي الخيار الآمن؛ لا أحد ينزعج من احترام زائد.',
        examples: [
          { chinese: '你好！', pinyin: 'nǐ hǎo!', arabic: 'مرحباً! (لصديق)', english: 'Hello! (to a friend)' },
          { chinese: '您好，老师！', pinyin: 'nín hǎo, lǎoshī!', arabic: 'مرحباً يا أستاذ! (باحترام)', english: 'Hello, teacher! (respectful)' },
          { chinese: '您是王老师吗？', pinyin: 'nín shì Wáng lǎoshī ma?', arabic: 'هل أنتَ الأستاذ وانغ؟', english: 'Are you Teacher Wang?' },
        ],
        common_mistakes: [
          { wrong: '您好，小明！(to your young friend)', right: '你好，小明！', wrong_pinyin: 'Nín hǎo, Xiǎomíng!', right_pinyin: 'Nǐ hǎo, Xiǎomíng!', note_en: 'Using 您 with close friends or children sounds distant and overly stiff.', note_ar: 'استخدام 您 مع الأصدقاء المقربين أو الأطفال يبدو متكلفاً وبارداً.' },
        ],
      }),
      P({
        id: 'g1-2', order_num: 2,
        title_en: '你好 vs 您好 — choosing the right greeting',
        title_ar: '你好 مقابل 您好 — اختيار التحية المناسبة',
        pattern: '你好 → friends · 您好 → elders / teachers / customers',
        explanation_en: 'The greeting follows the same rule as the pronoun: 你好 (nǐ hǎo) is friendly and neutral, 您好 (nín hǎo) shows respect. Shop staff greet customers with 您好; students greet teachers with 您好.',
        explanation_ar: 'تتبع التحية نفس قاعدة الضمير: 你好 ودّية ومحايدة، بينما 您好 تُظهر الاحترام. موظفو المتاجر يحيّون الزبائن بـ您好، والطلاب يحيّون المعلمين بـ您好.',
        usage_en: 'Default to 你好 in daily life. Switch to 您好 in shops (as staff), offices, with teachers, elders, and first business meetings.',
        usage_ar: 'استخدم 你好 في الحياة اليومية، وانتقل إلى 您好 في المتاجر (كموظف) والمكاتب ومع المعلمين وكبار السن وأول الاجتماعات الرسمية.',
        formal_note_en: 'Formal: 您好 — Casual: 你好.',
        formal_note_ar: 'رسمي: 您好 — عادي: 你好.',
        examples: [
          { chinese: '你好，我叫李明。', pinyin: 'nǐ hǎo, wǒ jiào Lǐ Míng.', arabic: 'مرحباً، اسمي لي مينغ.', english: 'Hello, my name is Li Ming.' },
          { chinese: '您好，欢迎！', pinyin: 'nín hǎo, huānyíng!', arabic: 'أهلاً بك، مرحباً! (لزبون)', english: 'Hello, welcome! (to a customer)' },
        ],
        common_mistakes: [
          { wrong: '你好，王老师！', right: '您好，王老师！', wrong_pinyin: 'Nǐ hǎo, Wáng lǎoshī!', right_pinyin: 'Nín hǎo, Wáng lǎoshī!', note_en: 'With teachers, 您好 is the expected polite greeting.', note_ar: 'مع المعلمين، 您好 هي التحية المهذبة المتوقعة.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g1-e1', order_num: 1, type: 'formal_casual', prompt_en: 'You are speaking to a teacher. Which greeting is better?', prompt_ar: 'أنت تتحدث إلى معلم. أي تحية أنسب؟', options: ['你好', '您好'], correct: '您好', correct_pinyin: 'Nín hǎo!', explanation_en: 'Teachers receive the respectful 您好.', explanation_ar: 'المعلمون يُحيَّون بصيغة الاحترام 您好.' }),
      E({ id: 'g1-e2', order_num: 2, type: 'context_choice', prompt_en: 'You are speaking to a child. Which "you" is natural?', prompt_ar: 'أنت تتحدث إلى طفل. أي "أنت" هي الطبيعية؟', options: ['你', '您'], correct: '你', correct_pinyin: 'nǐ', explanation_en: '您 with a child sounds strange — keep it casual.', explanation_ar: '您 مع طفل تبدو غريبة — استخدم الصيغة العادية.' }),
      E({ id: 'g1-e3', order_num: 3, type: 'fill_blank', prompt_en: 'Greeting your boss: ___ 好！', prompt_ar: 'تحية مديرك: ___ 好！', chinese: '___ 好！', options: ['你', '您'], correct: '您', correct_pinyin: 'Nín hǎo!', explanation_en: 'Bosses get the respectful form.', explanation_ar: 'المدير يُخاطَب بصيغة الاحترام.' }),
      E({ id: 'g1-e4', order_num: 4, type: 'word_order', prompt_en: 'Build: "Hello, teacher!"', prompt_ar: 'كوّن: "مرحباً يا أستاذ!"', words: ['您好', '，', '老师', '！'], correct: '您好，老师！', correct_pinyin: 'Nín hǎo, lǎoshī!' }),
      E({ id: 'g1-e5', order_num: 5, type: 'match_zh_pinyin', prompt_en: 'Match the Chinese to its Pinyin:', prompt_ar: 'طابق الصيني مع البينين:', correct: '', pairs: [
        { left: '你', right: 'nǐ' },
        { left: '您', right: 'nín' },
        { left: '你好', right: 'nǐ hǎo' },
        { left: '老师', right: 'lǎoshī' },
      ] }),
    ],
  },

  // ============ Lesson 2: 谢谢 Thank You ============
  2: {
    points: [
      P({
        id: 'g2-1', order_num: 1,
        title_en: 'Polite exchanges: 谢谢 → 不客气',
        title_ar: 'التبادلات المهذبة: 谢谢 ← 不客气',
        pattern: 'A: 谢谢(你/您)！ → B: 不客气！',
        explanation_en: 'Politeness in Chinese works in fixed pairs. When someone says 谢谢 (thank you), the standard reply is 不客气 (bú kèqi — "don\'t be polite" = you\'re welcome). You can strengthen thanks with 谢谢你 / 谢谢您.',
        explanation_ar: 'المجاملات في الصينية تأتي في أزواج ثابتة. عندما يقول أحدهم 谢谢 (شكراً)، يكون الرد القياسي 不客气 (بمعنى "لا داعي للتكلف" = عفواً). ويمكن تقوية الشكر بـ谢谢你 أو 谢谢您.',
        usage_en: 'Use 谢谢 for any favor, gift, or service. Reply with 不客气 every time — silence after 谢谢 feels cold.',
        usage_ar: 'استخدم 谢谢 لأي معروف أو هدية أو خدمة، وردّ بـ不客气 دائماً — فالصمت بعد الشكر يبدو جافاً.',
        formal_note_en: 'More formal thanks: 谢谢您. Very casual among friends: 谢啦 (xiè la).',
        formal_note_ar: 'شكر أكثر رسمية: 谢谢您. وبين الأصدقاء بشكل عفوي جداً: 谢啦.',
        examples: [
          { chinese: 'A: 谢谢你！ B: 不客气！', pinyin: 'xièxie nǐ! — bú kèqi!', arabic: 'أ: شكراً لك! ب: عفواً!', english: 'A: Thank you! B: You\'re welcome!' },
          { chinese: '谢谢您，老师！', pinyin: 'xièxie nín, lǎoshī!', arabic: 'شكراً لك يا أستاذ!', english: 'Thank you, teacher! (respectful)' },
        ],
        common_mistakes: [
          { wrong: '(saying nothing after 谢谢)', right: '不客气！', wrong_pinyin: '', right_pinyin: 'Bú kèqi!', note_en: 'Always close the pair — replying is part of the politeness.', note_ar: 'أكمل الزوج دائماً — الرد جزء من الأدب.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g2-e1', order_num: 1, type: 'dialogue', prompt_en: 'Complete the dialogue — A: 谢谢！ B: ___', prompt_ar: 'أكمل الحوار — أ: 谢谢！ ب: ___', chinese: 'A: 谢谢！ B: ___', options: ['不客气！', '你好！', '再见！'], correct: '不客气！', correct_pinyin: 'Bú kèqi!', explanation_en: '不客气 is the set reply to thanks.', explanation_ar: '不客气 هي الرد الثابت على الشكر.' }),
      E({ id: 'g2-e2', order_num: 2, type: 'formal_casual', prompt_en: 'Thanking an elderly customer — which is better?', prompt_ar: 'تشكر زبوناً كبيراً في السن — أيهما أنسب؟', options: ['谢谢你', '谢谢您'], correct: '谢谢您', correct_pinyin: 'Xièxie nín', explanation_en: '您 carries the respect.', explanation_ar: '您 تحمل معنى الاحترام.' }),
      E({ id: 'g2-e3', order_num: 3, type: 'word_order', prompt_en: 'Build: "Thank you, teacher!"', prompt_ar: 'كوّن: "شكراً لك يا أستاذ!"', words: ['谢谢', '您', '，', '老师', '！'], correct: '谢谢您，老师！', correct_pinyin: 'Xièxie nín, lǎoshī!' }),
      E({ id: 'g2-e4', order_num: 4, type: 'match_pinyin_meaning', prompt_en: 'Match the Pinyin to its meaning:', prompt_ar: 'طابق البينين مع معناه:', correct: '', pairs: [
        { left: 'xièxie', right: 'thank you · شكراً' },
        { left: 'bú kèqi', right: "you're welcome · عفواً" },
        { left: 'nǐ hǎo', right: 'hello · مرحباً' },
      ] }),
    ],
  },

  // ============ Lesson 3: 你叫什么名字？ What Is Your Name? ============
  3: {
    points: [
      P({
        id: 'g3-1', order_num: 1,
        title_en: 'Question word 什么 (what) — no word-order change',
        title_ar: 'أداة الاستفهام 什么 (ماذا) — بدون تغيير ترتيب الجملة',
        pattern: 'Statement order + 什么 in the answer\'s position',
        explanation_en: 'Chinese questions keep normal sentence order. The question word 什么 simply sits where the answer would be: 你叫什么名字？ literally "You are-called WHAT name?" — no inversion like English.',
        explanation_ar: 'الأسئلة في الصينية تحافظ على ترتيب الجملة العادي. أداة 什么 تجلس في نفس مكان الإجابة: 你叫什么名字؟ حرفياً "أنت تُدعى ماذا اسماً؟" — لا قلب للترتيب كما في الإنجليزية.',
        usage_en: 'Use 什么 to ask about things and names: 这是什么？(What is this?) 你叫什么名字？(What\'s your name?)',
        usage_ar: 'استخدم 什么 للسؤال عن الأشياء والأسماء: 这是什么؟ (ما هذا؟) 你叫什么名字؟ (ما اسمك؟)',
        examples: [
          { chinese: '你叫什么名字？', pinyin: 'nǐ jiào shénme míngzi?', arabic: 'ما اسمك؟', english: 'What is your name?' },
          { chinese: '这是什么？', pinyin: 'zhè shì shénme?', arabic: 'ما هذا؟', english: 'What is this?' },
          { chinese: '他是谁？', pinyin: 'tā shì shéi?', arabic: 'من هو؟', english: 'Who is he? (谁 = who, same rule)' },
        ],
        common_mistakes: [
          { wrong: '什么你叫名字？', right: '你叫什么名字？', wrong_pinyin: 'Shénme nǐ jiào míngzi?', right_pinyin: 'Nǐ jiào shénme míngzi?', note_en: 'Don\'t move the question word to the front like English "What...".', note_ar: 'لا تنقل أداة الاستفهام إلى البداية كما في الإنجليزية.' },
        ],
      }),
      P({
        id: 'g3-2', order_num: 2,
        title_en: '的 for possession',
        title_ar: '的 للملكية',
        pattern: 'Owner + 的 + Thing',
        explanation_en: '的 (de) links an owner to a thing: 我的名字 = my name, 老师的书 = the teacher\'s book. With close relationships (family, friends) 的 is often dropped: 我妈妈 = my mom.',
        explanation_ar: '的 تربط المالك بالشيء: 我的名字 = اسمي، 老师的书 = كتاب المعلم. ومع العلاقات القريبة (العائلة والأصدقاء) تُحذف 的 غالباً: 我妈妈 = أمي.',
        usage_en: 'Use Owner+的+Thing for possession. Drop 的 for close people: 我妈妈, 我朋友.',
        usage_ar: 'استخدم: المالك + 的 + الشيء. واحذف 的 مع الأشخاص المقربين: 我妈妈، 我朋友.',
        examples: [
          { chinese: '我的名字是李明。', pinyin: 'wǒ de míngzi shì Lǐ Míng.', arabic: 'اسمي لي مينغ.', english: 'My name is Li Ming.' },
          { chinese: '这是老师的书。', pinyin: 'zhè shì lǎoshī de shū.', arabic: 'هذا كتاب المعلم.', english: 'This is the teacher\'s book.' },
        ],
        common_mistakes: [
          { wrong: '名字我的', right: '我的名字', wrong_pinyin: 'míngzi wǒ de', right_pinyin: 'wǒ de míngzi', note_en: 'The owner always comes first.', note_ar: 'المالك يأتي أولاً دائماً.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g3-e1', order_num: 1, type: 'word_order', prompt_en: 'Build: "What is your name?"', prompt_ar: 'كوّن: "ما اسمك؟"', words: ['你', '叫', '什么', '名字', '？'], correct: '你叫什么名字？', correct_pinyin: 'Nǐ jiào shénme míngzi?' }),
      E({ id: 'g3-e2', order_num: 2, type: 'fill_blank', prompt_en: 'My name: 我 ___ 名字', prompt_ar: 'اسمي: 我 ___ 名字', chinese: '我 ___ 名字', options: ['的', '是', '吗'], correct: '的', correct_pinyin: 'Wǒ de míngzi', explanation_en: '的 marks possession.', explanation_ar: '的 علامة الملكية.' }),
      E({ id: 'g3-e3', order_num: 3, type: 'fill_blank', prompt_en: 'Asking about a thing: 这是 ___ ？', prompt_ar: 'سؤال عن شيء: 这是 ___ ؟', chinese: '这是 ___ ？', options: ['什么', '谁', '哪儿'], correct: '什么', correct_pinyin: 'Zhè shì shénme?', explanation_en: '什么 = what (thing); 谁 = who; 哪儿 = where.', explanation_ar: '什么 = ماذا؛ 谁 = من؛ 哪儿 = أين.' }),
    ],
  },

  // ============ Lesson 4: 老师 Teacher ============
  4: {
    points: [
      P({
        id: 'g4-1', order_num: 1,
        title_en: 'A 是 B — "A is B"',
        title_ar: 'A 是 B — "أ هو ب"',
        pattern: 'A + 是 + B',
        explanation_en: '是 (shì) connects two nouns: 我是老师 = I am a teacher. 是 never changes form — no am/is/are. Important: adjectives do NOT use 是 (that is Lesson 12\'s 很 rule).',
        explanation_ar: '是 تربط اسمين: 我是老师 = أنا معلم. ولا تتغير صيغتها أبداً. مهم: الصفات لا تستخدم 是 (تلك قاعدة 很 في الدرس 12).',
        usage_en: 'Use 是 for identity and category: profession, nationality, names. 他是学生 / 我是阿曼人.',
        usage_ar: 'استخدم 是 للهوية والتصنيف: المهنة والجنسية والأسماء. 他是学生 / 我是阿曼人 (أنا عماني).',
        examples: [
          { chinese: '我是老师。', pinyin: 'wǒ shì lǎoshī.', arabic: 'أنا معلم.', english: 'I am a teacher.' },
          { chinese: '他是学生。', pinyin: 'tā shì xuésheng.', arabic: 'هو طالب.', english: 'He is a student.' },
        ],
        common_mistakes: [
          { wrong: '我是很好', right: '我很好', wrong_pinyin: 'Wǒ shì hěn hǎo', right_pinyin: 'Wǒ hěn hǎo', note_en: 'No 是 before adjectives.', note_ar: 'لا تستخدم 是 قبل الصفات.' },
        ],
      }),
      P({
        id: 'g4-2', order_num: 2,
        title_en: '不 for negation',
        title_ar: '不 للنفي',
        pattern: 'Subject + 不 + Verb',
        explanation_en: 'Put 不 (bù) directly before the verb to negate it: 我不是老师 = I am not a teacher. 不 covers present/future habits and states (有 is the exception — it takes 没, never 不).',
        explanation_ar: 'ضع 不 مباشرة قبل الفعل للنفي: 我不是老师 = لستُ معلماً. تُستخدم 不 للحاضر والمستقبل والعادات (الاستثناء 有 التي تُنفى بـ没 وليس 不).',
        usage_en: 'Negate 是, 喜欢, 会, 想 and most verbs with 不. Never say 不有 — say 没有.',
        usage_ar: 'انفِ 是 و喜欢 و会 و想 ومعظم الأفعال بـ不. لا تقل أبداً 不有 — بل 没有.',
        examples: [
          { chinese: '我不是老师。', pinyin: 'wǒ bú shì lǎoshī.', arabic: 'لستُ معلماً.', english: 'I am not a teacher.' },
          { chinese: '他不喜欢茶。', pinyin: 'tā bù xǐhuan chá.', arabic: 'هو لا يحب الشاي.', english: 'He doesn\'t like tea.' },
        ],
        common_mistakes: [
          { wrong: '我不有书', right: '我没有书', wrong_pinyin: 'Wǒ bù yǒu shū', right_pinyin: 'Wǒ méiyǒu shū', note_en: '有 is negated with 没, never 不.', note_ar: '有 تُنفى بـ没 وليس بـ不 أبداً.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g4-e1', order_num: 1, type: 'fill_blank', prompt_en: '你 ___ 老师吗？', prompt_ar: '你 ___ 老师吗？', chinese: '你 ___ 老师吗？', options: ['是', '在', '有'], correct: '是', correct_pinyin: 'Nǐ shì lǎoshī ma?', explanation_en: 'Identity uses 是.', explanation_ar: 'الهوية تستخدم 是.' }),
      E({ id: 'g4-e2', order_num: 2, type: 'word_order', prompt_en: 'Build: "I am a student."', prompt_ar: 'كوّن: "أنا طالب."', words: ['学生', '我', '是', '。'], correct: '我是学生。', correct_pinyin: 'Wǒ shì xuésheng.' }),
      E({ id: 'g4-e4', order_num: 4, type: 'type_pinyin', prompt_en: 'Type the Pinyin for this sentence:', prompt_ar: 'اكتب البينين لهذه الجملة:', chinese: '我是学生。', correct: 'wǒ shì xuésheng' }),
      E({ id: 'g4-e3', order_num: 3, type: 'transform_negative', prompt_en: 'Make it negative: 我是老师。', prompt_ar: 'حوّلها إلى النفي: 我是老师。', chinese: '我是老师。', options: ['我不是老师。', '我没是老师。', '不我是老师。'], correct: '我不是老师。', correct_pinyin: 'Wǒ bú shì lǎoshī.', explanation_en: '不 goes right before 是.', explanation_ar: '不 تأتي مباشرة قبل 是.' }),
    ],
  },

  // ============ Lesson 5: 你几岁？ How Old Are You? ============
  5: {
    points: [
      P({
        id: 'g5-1', order_num: 1,
        title_en: '几 vs 多少 — asking "how many"',
        title_ar: '几 مقابل 多少 — السؤال عن "كم"',
        pattern: '几 + measure word (small numbers) · 多少 (any number)',
        explanation_en: '几 (jǐ) expects a small answer (usually under 10) and needs a measure word: 你几岁？(child\'s age), 几个人？ 多少 (duōshao) works for any quantity and the measure word is optional: 多少钱？ For adults\' age, use 你多大？',
        explanation_ar: '几 تتوقع إجابة صغيرة (عادة أقل من 10) وتحتاج كلمة عدّ: 你几岁؟ (عمر طفل)، 几个人؟ أما 多少 فتصلح لأي كمية وكلمة العدّ اختيارية: 多少钱؟ ولسؤال البالغين عن العمر: 你多大؟',
        usage_en: 'Ask a child 你几岁？; ask an adult 你多大？; ask prices 多少钱？',
        usage_ar: 'اسأل طفلاً: 你几岁؟ واسأل بالغاً: 你多大؟ واسأل عن السعر: 多少钱؟',
        formal_note_en: 'Asking an elder\'s age politely: 您多大年纪？',
        formal_note_ar: 'لسؤال كبير السن عن عمره بأدب: 您多大年纪؟',
        examples: [
          { chinese: '你几岁？', pinyin: 'nǐ jǐ suì?', arabic: 'كم عمرك؟ (لطفل)', english: 'How old are you? (to a child)' },
          { chinese: '你多大？', pinyin: 'nǐ duō dà?', arabic: 'كم عمرك؟ (لبالغ)', english: 'How old are you? (to an adult)' },
          { chinese: '这个多少钱？', pinyin: 'zhège duōshao qián?', arabic: 'بكم هذا؟', english: 'How much is this?' },
        ],
        common_mistakes: [
          { wrong: '你几大？', right: '你多大？', wrong_pinyin: 'Nǐ jǐ dà?', right_pinyin: 'Nǐ duō dà?', note_en: '几 doesn\'t pair with 大; use 多大 for adult age.', note_ar: '几 لا تأتي مع 大؛ استخدم 多大 لعمر البالغين.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g5-e1', order_num: 1, type: 'context_choice', prompt_en: 'Asking a 5-year-old their age — which is natural?', prompt_ar: 'تسأل طفلاً عمره ٥ سنوات عن عمره — أيهما أنسب؟', options: ['你几岁？', '您多大年纪？'], correct: '你几岁？', correct_pinyin: 'Nǐ jǐ suì?', explanation_en: '几岁 is the natural way to ask children.', explanation_ar: '几岁 هي الطريقة الطبيعية لسؤال الأطفال.' }),
      E({ id: 'g5-e2', order_num: 2, type: 'fill_blank', prompt_en: 'Asking a price: 这个 ___ 钱？', prompt_ar: 'سؤال عن السعر: 这个 ___ 钱؟', chinese: '这个 ___ 钱？', options: ['多少', '几', '什么'], correct: '多少', correct_pinyin: 'Zhège duōshao qián?', explanation_en: 'Prices can be any number → 多少.', explanation_ar: 'الأسعار قد تكون أي رقم ← 多少.' }),
      E({ id: 'g5-e3', order_num: 3, type: 'word_order', prompt_en: 'Build: "How old are you?" (to a child)', prompt_ar: 'كوّن: "كم عمرك؟" (لطفل)', words: ['你', '几', '岁', '？'], correct: '你几岁？', correct_pinyin: 'Nǐ jǐ suì?' }),
    ],
  },

  // ============ Lesson 6: 我会说汉语 I Can Speak Chinese ============
  6: {
    points: [
      P({
        id: 'g6-1', order_num: 1,
        title_en: '会 — learned ability ("can")',
        title_ar: '会 — القدرة المكتسبة ("يستطيع")',
        pattern: 'Subject + 会 + Verb',
        explanation_en: '会 (huì) means "can" for skills you learned: speaking a language, swimming, cooking. Negative: 不会. 我会说汉语 = I can speak Chinese.',
        explanation_ar: '会 تعني "يستطيع" للمهارات المكتسبة: التحدث بلغة، السباحة، الطبخ. النفي: 不会. 我会说汉语 = أستطيع التحدث بالصينية.',
        usage_en: 'Use 会 for learned skills. 我会游泳 (I can swim), 他不会做饭 (he can\'t cook).',
        usage_ar: 'استخدم 会 للمهارات المتعلَّمة: 我会游泳 (أجيد السباحة)، 他不会做饭 (لا يجيد الطبخ).',
        examples: [
          { chinese: '我会说汉语。', pinyin: 'wǒ huì shuō hànyǔ.', arabic: 'أستطيع التحدث بالصينية.', english: 'I can speak Chinese.' },
          { chinese: '他不会游泳。', pinyin: 'tā bú huì yóuyǒng.', arabic: 'هو لا يجيد السباحة.', english: 'He can\'t swim.' },
        ],
        common_mistakes: [
          { wrong: '我会汉语', right: '我会说汉语', wrong_pinyin: 'Wǒ huì hànyǔ', right_pinyin: 'Wǒ huì shuō hànyǔ', note_en: '会 needs the verb (说) — you "can speak" a language.', note_ar: '会 تحتاج الفعل (说) — أنت "تستطيع التحدث" باللغة.' },
        ],
      }),
      P({
        id: 'g6-2', order_num: 2,
        title_en: '吗 — yes/no questions',
        title_ar: '吗 — أسئلة نعم/لا',
        pattern: 'Statement + 吗？',
        explanation_en: 'Add 吗 (ma) to the end of any statement to turn it into a yes/no question — no word-order change at all. 你会说汉语。→ 你会说汉语吗？',
        explanation_ar: 'أضف 吗 إلى نهاية أي جملة خبرية لتحويلها إلى سؤال نعم/لا — دون أي تغيير في الترتيب. 你会说汉语。← 你会说汉语吗؟',
        usage_en: 'Use 吗 for yes/no questions only. Never combine it with question words: 你叫什么名字吗？ is wrong.',
        usage_ar: 'استخدم 吗 لأسئلة نعم/لا فقط، ولا تجمعها مع أدوات الاستفهام: 你叫什么名字吗؟ خطأ.',
        examples: [
          { chinese: '你会说汉语吗？', pinyin: 'nǐ huì shuō hànyǔ ma?', arabic: 'هل تستطيع التحدث بالصينية؟', english: 'Can you speak Chinese?' },
          { chinese: '你是学生吗？', pinyin: 'nǐ shì xuésheng ma?', arabic: 'هل أنت طالب؟', english: 'Are you a student?' },
        ],
        common_mistakes: [
          { wrong: '你叫什么名字吗？', right: '你叫什么名字？', note_en: '吗 never appears with 什么/谁/哪儿 etc.', note_ar: '吗 لا تجتمع أبداً مع 什么/谁/哪儿 وغيرها.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g6-e1', order_num: 1, type: 'transform_question', prompt_en: 'Turn into a question: 你是学生。', prompt_ar: 'حوّلها إلى سؤال: 你是学生。', chinese: '你是学生。', options: ['你是学生吗？', '吗你是学生？', '你是吗学生？'], correct: '你是学生吗？', correct_pinyin: 'Nǐ shì xuésheng ma?', explanation_en: '吗 attaches to the very end.', explanation_ar: '吗 تلتصق بنهاية الجملة تماماً.' }),
      E({ id: 'g6-e2', order_num: 2, type: 'fill_blank', prompt_en: 'I can swim: 我 ___ 游泳', prompt_ar: 'أجيد السباحة: 我 ___ 游泳', chinese: '我 ___ 游泳', options: ['会', '是', '的'], correct: '会', correct_pinyin: 'Wǒ huì yóuyǒng', explanation_en: 'Learned skill → 会.', explanation_ar: 'مهارة مكتسبة ← 会.' }),
      E({ id: 'g6-e3', order_num: 3, type: 'word_order', prompt_en: 'Build: "Can you speak Chinese?"', prompt_ar: 'كوّن: "هل تتحدث الصينية؟"', words: ['你', '会', '说', '汉语', '吗', '？'], correct: '你会说汉语吗？', correct_pinyin: 'Nǐ huì shuō hànyǔ ma?' }),
    ],
  },

  // ============ Lesson 7: 今天几号？ What Date Is Today? ============
  7: {
    points: [
      P({
        id: 'g7-1', order_num: 1,
        title_en: 'Time word order — time before the verb',
        title_ar: 'ترتيب كلمات الزمن — الزمن قبل الفعل',
        pattern: 'Subject + Time + Verb  ·  or  Time + Subject + Verb',
        explanation_en: 'Time words (今天, 明天, 七点) come BEFORE the verb — never at the end like English. 我今天工作 = I work today (NOT 我工作今天). Dates also follow big-to-small order: year → month → day.',
        explanation_ar: 'كلمات الزمن (今天، 明天، 七点) تأتي قبل الفعل — وليس في النهاية كما في الإنجليزية. 我今天工作 = أعمل اليوم (وليس 我工作今天). والتواريخ تتبع ترتيب الأكبر فالأصغر: سنة ← شهر ← يوم.',
        usage_en: 'Put time right after the subject (or at the very front for emphasis): 明天我去学校 / 我明天去学校.',
        usage_ar: 'ضع الزمن بعد الفاعل مباشرة (أو في البداية للتأكيد): 明天我去学校 / 我明天去学校.',
        examples: [
          { chinese: '今天几号？', pinyin: 'jīntiān jǐ hào?', arabic: 'كم التاريخ اليوم؟', english: 'What\'s the date today?' },
          { chinese: '我今天工作。', pinyin: 'wǒ jīntiān gōngzuò.', arabic: 'أعمل اليوم.', english: 'I work today.' },
          { chinese: '二〇二六年六月十二号', pinyin: 'èr líng èr liù nián liù yuè shí\'èr hào', arabic: '١٢ يونيو ٢٠٢٦ (سنة-شهر-يوم)', english: 'June 12, 2026 (year-month-day)' },
        ],
        common_mistakes: [
          { wrong: '我工作今天', right: '我今天工作', wrong_pinyin: 'Wǒ gōngzuò jīntiān', right_pinyin: 'Wǒ jīntiān gōngzuò', note_en: 'Time can\'t trail the verb.', note_ar: 'الزمن لا يأتي بعد الفعل.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g7-e1', order_num: 1, type: 'word_order', prompt_en: 'Build: "I work today."', prompt_ar: 'كوّن: "أعمل اليوم."', words: ['我', '今天', '工作', '。'], correct: '我今天工作。', correct_pinyin: 'Wǒ jīntiān gōngzuò.' }),
      E({ id: 'g7-e2', order_num: 2, type: 'fill_blank', prompt_en: 'Correct date order: 2026 ___', prompt_ar: 'ترتيب التاريخ الصحيح: 2026 ___', options: ['年六月十二号', '号六月年', '六月年号'], correct: '年六月十二号', correct_pinyin: 'èr líng èr liù nián liù yuè shí\'èr hào', explanation_en: 'Big to small: 年 → 月 → 号.', explanation_ar: 'من الأكبر إلى الأصغر: 年 ← 月 ← 号.' }),
      E({ id: 'g7-e3', order_num: 3, type: 'context_choice', prompt_en: 'Which sentence is correct?', prompt_ar: 'أي جملة صحيحة؟', options: ['我明天去学校。', '我去学校明天。'], correct: '我明天去学校。', correct_pinyin: 'Wǒ míngtiān qù xuéxiào.', explanation_en: 'Time before the verb.', explanation_ar: 'الزمن قبل الفعل.' }),
    ],
  },

  // ============ Lesson 8: 我想喝茶 I Want to Drink Tea ============
  8: {
    points: [
      P({
        id: 'g8-1', order_num: 1,
        title_en: '想 + verb — "want to"',
        title_ar: '想 + فعل — "أريد أن"',
        pattern: 'Subject + 想 + Verb (+ Object)',
        explanation_en: '想 (xiǎng) before a verb means "want to / would like to": 我想喝茶 = I want to drink tea. It is softer and more polite than 要 (yào), which sounds more decided. Negative: 不想.',
        explanation_ar: '想 قبل الفعل تعني "أريد أن / أودّ أن": 我想喝茶 = أريد أن أشرب الشاي. وهي ألطف وأكثر تهذيباً من 要 التي تبدو أكثر حسماً. النفي: 不想.',
        usage_en: 'Use 想 for wishes and polite requests in cafés/restaurants. 要 = firm order; 想 = soft wish.',
        usage_ar: 'استخدم 想 للرغبات والطلبات المهذبة في المقاهي والمطاعم. 要 = طلب حازم؛ 想 = رغبة لطيفة.',
        formal_note_en: 'Ordering politely: 我想要一杯茶 or softer 我想喝杯茶. Direct: 我要茶.',
        formal_note_ar: 'للطلب بأدب: 我想要一杯茶 أو الألطف 我想喝杯茶. وللطلب المباشر: 我要茶.',
        examples: [
          { chinese: '我想喝茶。', pinyin: 'wǒ xiǎng hē chá.', arabic: 'أريد أن أشرب الشاي.', english: 'I want to drink tea.' },
          { chinese: '他不想去。', pinyin: 'tā bù xiǎng qù.', arabic: 'هو لا يريد الذهاب.', english: 'He doesn\'t want to go.' },
        ],
        common_mistakes: [
          { wrong: '我想茶', right: '我想喝茶', wrong_pinyin: 'Wǒ xiǎng chá', right_pinyin: 'Wǒ xiǎng hē chá', note_en: '想 + noun means "miss/think of"; for "want to" keep the verb (喝).', note_ar: '想 + اسم تعني "يشتاق إلى"؛ لمعنى "أريد أن" أبقِ الفعل (喝).' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g8-e1', order_num: 1, type: 'word_order', prompt_en: 'Build: "I want to drink tea."', prompt_ar: 'كوّن: "أريد أن أشرب الشاي."', words: ['我', '想', '喝', '茶', '。'], correct: '我想喝茶。', correct_pinyin: 'Wǒ xiǎng hē chá.' }),
      E({ id: 'g8-e2', order_num: 2, type: 'transform_negative', prompt_en: 'Make it negative: 我想去。', prompt_ar: 'حوّلها إلى النفي: 我想去。', chinese: '我想去。', options: ['我不想去。', '我想不去。', '不我想去。'], correct: '我不想去。', correct_pinyin: 'Wǒ bù xiǎng qù.', explanation_en: '不 sits before 想.', explanation_ar: '不 تسبق 想.' }),
      E({ id: 'g8-e3', order_num: 3, type: 'formal_casual', prompt_en: 'Politely ordering in a café — which is softer?', prompt_ar: 'تطلب بأدب في مقهى — أيهما ألطف؟', options: ['我要茶！', '我想要一杯茶。'], correct: '我想要一杯茶。', correct_pinyin: 'Wǒ xiǎng yào yì bēi chá.', explanation_en: '想(要) softens the request.', explanation_ar: '想(要) تجعل الطلب ألطف.' }),
    ],
  },
};
