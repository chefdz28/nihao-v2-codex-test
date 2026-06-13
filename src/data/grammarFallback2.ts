// V2.0.3 fallback grammar content — lessons 9–15 (merged into grammarFallback).
import type { GrammarPoint, GrammarExercise } from '@/types/grammar';
import { grammarFallback } from '@/data/grammarFallback';

type LessonGrammarData = { points: GrammarPoint[]; exercises: GrammarExercise[] };

const P = (p: Omit<GrammarPoint, 'lesson_id'>): GrammarPoint => ({ ...p, lesson_id: null });
const E = (e: Omit<GrammarExercise, 'lesson_id' | 'grammar_point_id'>): GrammarExercise => ({ ...e, lesson_id: null, grammar_point_id: null });

const part2: Record<number, LessonGrammarData> = {
  // ============ Lesson 9: 你在哪儿工作？ Where Do You Work? ============
  9: {
    points: [
      P({
        id: 'g9-1', order_num: 1,
        title_en: '在 for location + 哪儿 (where)',
        title_ar: '在 للمكان + 哪儿 (أين)',
        pattern: 'Subject + 在 + Place (+ Verb)',
        explanation_en: '在 (zài) marks location: 我在学校 = I am at school. With an action, the place phrase goes BEFORE the verb: 我在医院工作 = I work at a hospital. 哪儿 (nǎr) asks "where" and sits where the place would be.',
        explanation_ar: '在 تحدد المكان: 我在学校 = أنا في المدرسة. ومع وجود فعل، تأتي عبارة المكان قبل الفعل: 我在医院工作 = أعمل في المستشفى. و哪儿 تعني "أين" وتجلس مكان الإجابة.',
        usage_en: 'Being somewhere: Subject+在+Place. Doing something somewhere: Subject+在+Place+Verb. Asking: 你在哪儿？/ 你在哪儿工作？',
        usage_ar: 'الوجود في مكان: فاعل+在+مكان. وفعل شيء في مكان: فاعل+在+مكان+فعل. وللسؤال: 你在哪儿؟ / 你在哪儿工作؟',
        examples: [
          { chinese: '你在哪儿工作？', pinyin: 'nǐ zài nǎr gōngzuò?', arabic: 'أين تعمل؟', english: 'Where do you work?' },
          { chinese: '我在医院工作。', pinyin: 'wǒ zài yīyuàn gōngzuò.', arabic: 'أعمل في المستشفى.', english: 'I work at a hospital.' },
        ],
        common_mistakes: [
          { wrong: '我工作在医院', right: '我在医院工作', wrong_pinyin: 'Wǒ gōngzuò zài yīyuàn', right_pinyin: 'Wǒ zài yīyuàn gōngzuò', note_en: 'The 在-phrase comes before the verb, not after.', note_ar: 'عبارة 在 تأتي قبل الفعل لا بعده.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g9-e1', order_num: 1, type: 'fill_blank', prompt_en: 'I am at school: 我 ___ 学校', prompt_ar: 'أنا في المدرسة: 我 ___ 学校', chinese: '我 ___ 学校', options: ['在', '是', '有'], correct: '在', correct_pinyin: 'Wǒ zài xuéxiào', explanation_en: 'Location uses 在.', explanation_ar: 'المكان يستخدم 在.' }),
      E({ id: 'g9-e2', order_num: 2, type: 'word_order', prompt_en: 'Build: "I work at a hospital."', prompt_ar: 'كوّن: "أعمل في المستشفى."', words: ['我', '在', '医院', '工作', '。'], correct: '我在医院工作。', correct_pinyin: 'Wǒ zài yīyuàn gōngzuò.' }),
      E({ id: 'g9-e3', order_num: 3, type: 'fill_blank', prompt_en: 'Asking where: 你在 ___ 工作？', prompt_ar: 'السؤال عن المكان: 你在 ___ 工作؟', chinese: '你在 ___ 工作？', options: ['哪儿', '什么', '谁'], correct: '哪儿', correct_pinyin: 'Nǐ zài nǎr gōngzuò?', explanation_en: '哪儿 = where.', explanation_ar: '哪儿 = أين.' }),
    ],
  },

  // ============ Lesson 10: 请坐 Please Sit ============
  10: {
    points: [
      P({
        id: 'g10-1', order_num: 1,
        title_en: '请 for polite requests',
        title_ar: '请 للطلبات المهذبة',
        pattern: '请 + Verb (+ Object)',
        explanation_en: 'Start a request with 请 (qǐng) to make it polite: 请坐 = please sit, 请进 = please come in, 请喝茶 = please have some tea. It is the standard hospitality word.',
        explanation_ar: 'ابدأ الطلب بـ请 لجعله مهذباً: 请坐 = تفضل بالجلوس، 请进 = تفضل بالدخول، 请喝茶 = تفضل بشرب الشاي. وهي كلمة الضيافة القياسية.',
        usage_en: 'Use 请 when hosting guests, in service situations, and in any formal request. 请问 starts a polite question ("may I ask...").',
        usage_ar: 'استخدم 请 عند استقبال الضيوف وفي مواقف الخدمة وأي طلب رسمي. و请问 تبدأ سؤالاً مهذباً ("لو سمحت...").',
        formal_note_en: 'Formal/hospitality: 请坐 / 您请坐. Casual with friends: just 坐！(sit!).',
        formal_note_ar: 'رسمي/ضيافة: 请坐 / 您请坐. وبين الأصدقاء بعفوية: 坐！ فقط.',
        examples: [
          { chinese: '请坐！', pinyin: 'qǐng zuò!', arabic: 'تفضل بالجلوس!', english: 'Please sit!' },
          { chinese: '请问，洗手间在哪儿？', pinyin: 'qǐngwèn, xǐshǒujiān zài nǎr?', arabic: 'لو سمحت، أين الحمّام؟', english: 'Excuse me, where is the restroom?' },
        ],
        common_mistakes: [
          { wrong: '坐请', right: '请坐', wrong_pinyin: 'zuò qǐng', right_pinyin: 'qǐng zuò', note_en: '请 always comes first.', note_ar: '请 تأتي أولاً دائماً.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g10-e1', order_num: 1, type: 'fill_blank', prompt_en: 'Polite "please come in": ___ 进！', prompt_ar: '"تفضل بالدخول" بأدب: ___ 进！', chinese: '___ 进！', options: ['请', '想', '会'], correct: '请', correct_pinyin: 'Qǐng jìn!', explanation_en: '请 + verb = polite request.', explanation_ar: '请 + فعل = طلب مهذب.' }),
      E({ id: 'g10-e2', order_num: 2, type: 'formal_casual', prompt_en: 'Welcoming a guest to sit — which is right?', prompt_ar: 'ترحب بضيف ليجلس — أيهما الصحيح؟', options: ['坐！', '请坐！'], correct: '请坐！', correct_pinyin: 'Qǐng zuò!', explanation_en: 'Guests get 请.', explanation_ar: 'الضيوف يُخاطَبون بـ请.' }),
      E({ id: 'g10-e3', order_num: 3, type: 'dialogue', prompt_en: 'Asking a stranger for directions, you start with: ___', prompt_ar: 'تسأل غريباً عن الاتجاهات، تبدأ بـ: ___', options: ['请问', '你好吗', '谢谢'], correct: '请问', correct_pinyin: 'Qǐngwèn', explanation_en: '请问 politely opens a question.', explanation_ar: '请问 تفتتح السؤال بأدب.' }),
    ],
  },

  // ============ Lesson 11: 现在几点？ What Time Is It Now? ============
  11: {
    points: [
      P({
        id: 'g11-1', order_num: 1,
        title_en: '有 — "to have" (negated with 没)',
        title_ar: '有 — "يملك" (تُنفى بـ没)',
        pattern: 'Subject + 有 + Object  ·  Negative: 没有',
        explanation_en: '有 (yǒu) means "to have": 我有手表 = I have a watch. Its negative is special: 没有 (méiyǒu), never 不有. 你有时间吗？ = Do you have time?',
        explanation_ar: '有 تعني "يملك": 我有手表 = عندي ساعة. ونفيها خاص: 没有 وليس 不有 أبداً. 你有时间吗؟ = هل لديك وقت؟',
        usage_en: 'Possession (我有书), existence (有问题吗？), and availability (我没有时间).',
        usage_ar: 'للملكية (我有书)، والوجود (有问题吗؟)، والتوفر (我没有时间 = ليس لدي وقت).',
        examples: [
          { chinese: '你有时间吗？', pinyin: 'nǐ yǒu shíjiān ma?', arabic: 'هل لديك وقت؟', english: 'Do you have time?' },
          { chinese: '我没有手表。', pinyin: 'wǒ méiyǒu shǒubiǎo.', arabic: 'ليس عندي ساعة.', english: 'I don\'t have a watch.' },
        ],
        common_mistakes: [
          { wrong: '我不有时间', right: '我没有时间', wrong_pinyin: 'Wǒ bù yǒu shíjiān', right_pinyin: 'Wǒ méiyǒu shíjiān', note_en: '有 is the one verb that refuses 不.', note_ar: '有 هي الفعل الوحيد الذي يرفض 不.' },
        ],
      }),
      P({
        id: 'g11-2', order_num: 2,
        title_en: 'Telling time: 点 with time-before-verb order',
        title_ar: 'قول الوقت: 点 مع قاعدة الزمن قبل الفعل',
        pattern: 'Number + 点 (o\'clock) · Subject + Time + Verb',
        explanation_en: '点 (diǎn) marks the hour: 七点 = 7 o\'clock. Clock times follow the same rule as dates: before the verb. 我七点起床 = I get up at seven.',
        explanation_ar: '点 تحدد الساعة: 七点 = السابعة. وأوقات الساعة تتبع نفس قاعدة التواريخ: قبل الفعل. 我七点起床 = أستيقظ في السابعة.',
        usage_en: 'Ask 现在几点？; answer 现在三点。 Schedule actions: 我们八点上课.',
        usage_ar: 'اسأل: 现在几点؟ وأجب: 现在三点. وللمواعيد: 我们八点上课 (نبدأ الدرس في الثامنة).',
        examples: [
          { chinese: '现在几点？', pinyin: 'xiànzài jǐ diǎn?', arabic: 'كم الساعة الآن؟', english: 'What time is it now?' },
          { chinese: '我七点起床。', pinyin: 'wǒ qī diǎn qǐchuáng.', arabic: 'أستيقظ في السابعة.', english: 'I get up at seven.' },
        ],
        common_mistakes: [
          { wrong: '我起床七点', right: '我七点起床', wrong_pinyin: 'Wǒ qǐchuáng qī diǎn', right_pinyin: 'Wǒ qī diǎn qǐchuáng', note_en: 'Clock time goes before the verb.', note_ar: 'وقت الساعة يسبق الفعل.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g11-e1', order_num: 1, type: 'transform_negative', prompt_en: 'Make it negative: 我有时间。', prompt_ar: 'حوّلها إلى النفي: 我有时间。', chinese: '我有时间。', options: ['我没有时间。', '我不有时间。', '我没是时间。'], correct: '我没有时间。', correct_pinyin: 'Wǒ méiyǒu shíjiān.', explanation_en: '有 → 没有.', explanation_ar: '有 ← 没有.' }),
      E({ id: 'g11-e2', order_num: 2, type: 'word_order', prompt_en: 'Build: "I get up at seven."', prompt_ar: 'كوّن: "أستيقظ في السابعة."', words: ['我', '七点', '起床', '。'], correct: '我七点起床。', correct_pinyin: 'Wǒ qī diǎn qǐchuáng.' }),
      E({ id: 'g11-e3', order_num: 3, type: 'fill_blank', prompt_en: 'Do you have a watch? 你 ___ 手表吗？', prompt_ar: 'هل عندك ساعة؟ 你 ___ 手表吗؟', chinese: '你 ___ 手表吗？', options: ['有', '是', '在'], correct: '有', correct_pinyin: 'Nǐ yǒu shǒubiǎo ma?', explanation_en: 'Possession → 有.', explanation_ar: 'الملكية ← 有.' }),
    ],
  },

  // ============ Lesson 12: 天气怎么样？ How Is the Weather? ============
  12: {
    points: [
      P({
        id: 'g12-1', order_num: 1,
        title_en: '很 with adjectives — no 是!',
        title_ar: '很 مع الصفات — بدون 是!',
        pattern: 'Subject + 很 + Adjective',
        explanation_en: 'Adjectives connect directly to the subject with 很 (hěn) — NOT with 是. 天气很好 = the weather is good. Here 很 is mostly a grammatical glue; it barely means "very". A bare adjective without 很 implies comparison.',
        explanation_ar: 'الصفات ترتبط بالفاعل مباشرة عبر 很 — وليس عبر 是. 天气很好 = الطقس جيد. هنا 很 رابط نحوي في الغالب ولا تعني "جداً" بقوة. والصفة بدون 很 توحي بالمقارنة.',
        usage_en: 'Default pattern for describing: 我很好, 他很高, 中国菜很好吃. To truly stress "very", use 非常 or stress 很.',
        usage_ar: 'النمط الافتراضي للوصف: 我很好، 他很高، 中国菜很好吃. ولتأكيد "جداً" فعلاً استخدم 非常.',
        examples: [
          { chinese: '天气很好。', pinyin: 'tiānqì hěn hǎo.', arabic: 'الطقس جيد.', english: 'The weather is good.' },
          { chinese: '我很忙。', pinyin: 'wǒ hěn máng.', arabic: 'أنا مشغول.', english: 'I am busy.' },
        ],
        common_mistakes: [
          { wrong: '天气是好', right: '天气很好', wrong_pinyin: 'Tiānqì shì hǎo', right_pinyin: 'Tiānqì hěn hǎo', note_en: '是 links nouns, never adjectives.', note_ar: '是 تربط الأسماء فقط، لا الصفات.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g12-e1', order_num: 1, type: 'fill_blank', prompt_en: 'The weather is good: 天气 ___ 好', prompt_ar: 'الطقس جيد: 天气 ___ 好', chinese: '天气 ___ 好', options: ['很', '是', '有'], correct: '很', correct_pinyin: 'Tiānqì hěn hǎo', explanation_en: 'Adjective → 很, not 是.', explanation_ar: 'الصفة ← 很 وليس 是.' }),
      E({ id: 'g12-e2', order_num: 2, type: 'context_choice', prompt_en: 'Which sentence is correct?', prompt_ar: 'أي جملة صحيحة؟', options: ['我很忙。', '我是忙。'], correct: '我很忙。', correct_pinyin: 'Wǒ hěn máng.', explanation_en: 'Never 是 + adjective.', explanation_ar: 'لا تستخدم 是 + صفة أبداً.' }),
      E({ id: 'g12-e3', order_num: 3, type: 'word_order', prompt_en: 'Build: "Chinese food is delicious."', prompt_ar: 'كوّن: "الطعام الصيني لذيذ."', words: ['中国菜', '很', '好吃', '。'], correct: '中国菜很好吃。', correct_pinyin: 'Zhōngguó cài hěn hǎochī.' }),
    ],
  },

  // ============ Lesson 13: 我喜欢中国菜 I Like Chinese Food ============
  13: {
    points: [
      P({
        id: 'g13-1', order_num: 1,
        title_en: '也 (also) and 都 (all/both)',
        title_ar: '也 (أيضاً) و都 (كل/كلاهما)',
        pattern: 'Subject + 也/都 + Verb',
        explanation_en: '也 (yě, also) and 都 (dōu, all/both) sit between the subject and the verb — never at the end. 我也喜欢中国菜 = I also like Chinese food. 我们都喜欢 = we all like it. Order when combined: 也 before 都 (我们也都喜欢).',
        explanation_ar: '也 (أيضاً) و都 (كل/كلاهما) تأتيان بين الفاعل والفعل — وليس في النهاية أبداً. 我也喜欢中国菜 = أنا أيضاً أحب الطعام الصيني. 我们都喜欢 = كلنا نحبه. وعند الجمع: 也 قبل 都.',
        usage_en: '也 adds "me too / also". 都 totalizes a plural subject. 都 refers back to what is before it.',
        usage_ar: '也 تضيف معنى "أنا كذلك". و都 تشمل فاعلاً جمعاً، وتعود على ما قبلها.',
        examples: [
          { chinese: '我也喜欢中国菜。', pinyin: 'wǒ yě xǐhuan zhōngguó cài.', arabic: 'أنا أيضاً أحب الطعام الصيني.', english: 'I also like Chinese food.' },
          { chinese: '我们都喜欢茶。', pinyin: 'wǒmen dōu xǐhuan chá.', arabic: 'كلنا نحب الشاي.', english: 'We all like tea.' },
        ],
        common_mistakes: [
          { wrong: '我喜欢中国菜也', right: '我也喜欢中国菜', wrong_pinyin: 'Wǒ xǐhuan zhōngguó cài yě', right_pinyin: 'Wǒ yě xǐhuan zhōngguó cài', note_en: '也 cannot end a sentence.', note_ar: '也 لا تأتي في نهاية الجملة.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g13-e1', order_num: 1, type: 'word_order', prompt_en: 'Build: "I also like tea."', prompt_ar: 'كوّن: "أنا أيضاً أحب الشاي."', words: ['我', '也', '喜欢', '茶', '。'], correct: '我也喜欢茶。', correct_pinyin: 'Wǒ yě xǐhuan chá.' }),
      E({ id: 'g13-e2', order_num: 2, type: 'fill_blank', prompt_en: 'We ALL like Chinese food: 我们 ___ 喜欢中国菜', prompt_ar: 'كلنا نحب الطعام الصيني: 我们 ___ 喜欢中国菜', chinese: '我们 ___ 喜欢中国菜', options: ['都', '也', '很'], correct: '都', correct_pinyin: 'Wǒmen dōu xǐhuan zhōngguó cài', explanation_en: '都 totals the group.', explanation_ar: '都 تشمل المجموعة كلها.' }),
      E({ id: 'g13-e3', order_num: 3, type: 'context_choice', prompt_en: 'Your friend says 我喜欢茶. You agree ("me too"):', prompt_ar: 'صديقك يقول 我喜欢茶. وأنت توافقه ("وأنا أيضاً"):', options: ['我也喜欢茶。', '我都喜欢茶。'], correct: '我也喜欢茶。', correct_pinyin: 'Wǒ yě xǐhuan chá.', explanation_en: 'One person agreeing → 也.', explanation_ar: 'شخص واحد يوافق ← 也.' }),
    ],
  },

  // ============ Lesson 14: 这件衣服多少钱？ How Much Are These Clothes? ============
  14: {
    points: [
      P({
        id: 'g14-1', order_num: 1,
        title_en: 'Measure words: 个 · 本 · 杯 · 件',
        title_ar: 'كلمات العدّ: 个 · 本 · 杯 · 件',
        pattern: 'Number + Measure word + Noun',
        explanation_en: 'Chinese nouns need a measure word after numbers — like "a cup of" in English but for everything. 个 (gè) is the general one (一个人), 本 (běn) for books (两本书), 杯 (bēi) for cups/drinks (一杯茶), 件 (jiàn) for clothes (这件衣服). 这/那 also take one: 这个, 那本.',
        explanation_ar: 'الأسماء الصينية تحتاج كلمة عدّ بعد الأرقام — مثل "كوب من" بالعربية لكن لكل شيء. 个 العامة (一个人 شخص واحد)، 本 للكتب (两本书 كتابان)، 杯 للأكواب والمشروبات (一杯茶 كوب شاي)، 件 للملابس (这件衣服 هذه القطعة). و这/那 تأخذان كلمة عدّ أيضاً: 这个، 那本.',
        usage_en: 'When unsure, 个 is the safest guess — but learn the common ones with their nouns.',
        usage_ar: 'عند الشك، 个 هي الخيار الأسلم — لكن احفظ الشائعة مع أسمائها.',
        examples: [
          { chinese: '这件衣服多少钱？', pinyin: 'zhè jiàn yīfu duōshao qián?', arabic: 'بكم هذه الملابس؟', english: 'How much are these clothes?' },
          { chinese: '我想要一杯茶。', pinyin: 'wǒ xiǎng yào yì bēi chá.', arabic: 'أريد كوب شاي.', english: 'I would like a cup of tea.' },
          { chinese: '我有两本书。', pinyin: 'wǒ yǒu liǎng běn shū.', arabic: 'عندي كتابان.', english: 'I have two books.' },
        ],
        common_mistakes: [
          { wrong: '一书', right: '一本书', wrong_pinyin: 'yì shū', right_pinyin: 'yì běn shū', note_en: 'Never attach a number directly to the noun.', note_ar: 'لا تُلصق الرقم بالاسم مباشرة أبداً.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g14-e1', order_num: 1, type: 'fill_blank', prompt_en: 'A cup of tea: 一 ___ 茶', prompt_ar: 'كوب شاي: 一 ___ 茶', chinese: '一 ___ 茶', options: ['杯', '本', '件'], correct: '杯', correct_pinyin: 'yì bēi chá', explanation_en: '杯 for drinks.', explanation_ar: '杯 للمشروبات.' }),
      E({ id: 'g14-e2', order_num: 2, type: 'fill_blank', prompt_en: 'Two books: 两 ___ 书', prompt_ar: 'كتابان: 两 ___ 书', chinese: '两 ___ 书', options: ['本', '个', '杯'], correct: '本', correct_pinyin: 'liǎng běn shū', explanation_en: '本 for books.', explanation_ar: '本 للكتب.' }),
      E({ id: 'g14-e3', order_num: 3, type: 'word_order', prompt_en: 'Build: "How much are these clothes?"', prompt_ar: 'كوّن: "بكم هذه الملابس؟"', words: ['这件', '衣服', '多少', '钱', '？'], correct: '这件衣服多少钱？', correct_pinyin: 'Zhè jiàn yīfu duōshao qián?' }),
    ],
  },

  // ============ Lesson 15: 我坐飞机去中国 I Go to China by Plane ============
  15: {
    points: [
      P({
        id: 'g15-1', order_num: 1,
        title_en: 'Serial verbs: 坐 + transport + 去 + place',
        title_ar: 'الأفعال المتسلسلة: 坐 + وسيلة + 去 + مكان',
        pattern: 'Subject + 坐 + Transport + 去 + Place',
        explanation_en: 'Chinese chains verbs in the order things happen: first you board (坐 the plane), then you go (去 China). 我坐飞机去中国 = I take a plane and go to China. The transport phrase always comes before 去.',
        explanation_ar: 'تتسلسل الأفعال في الصينية بترتيب حدوثها: أولاً تركب (坐 الطائرة) ثم تذهب (去 إلى الصين). 我坐飞机去中国 = أركب الطائرة وأذهب إلى الصين. عبارة المواصلات تسبق 去 دائماً.',
        usage_en: 'Use this for any "go by X": 坐公共汽车去学校 (go to school by bus), 坐火车去北京. Walking: 走路去.',
        usage_ar: 'استخدمه لأي "الذهاب بواسطة": 坐公共汽车去学校 (إلى المدرسة بالحافلة)، 坐火车去北京. وسيراً: 走路去.',
        examples: [
          { chinese: '我坐飞机去中国。', pinyin: 'wǒ zuò fēijī qù zhōngguó.', arabic: 'أسافر إلى الصين بالطائرة.', english: 'I go to China by plane.' },
          { chinese: '他坐公共汽车去学校。', pinyin: 'tā zuò gōnggòng qìchē qù xuéxiào.', arabic: 'يذهب إلى المدرسة بالحافلة.', english: 'He goes to school by bus.' },
        ],
        common_mistakes: [
          { wrong: '我去中国坐飞机', right: '我坐飞机去中国', wrong_pinyin: 'Wǒ qù Zhōngguó zuò fēijī', right_pinyin: 'Wǒ zuò fēijī qù Zhōngguó', note_en: 'Transport first, destination second — the order of real events.', note_ar: 'الوسيلة أولاً ثم الوجهة — بترتيب الأحداث الواقعي.' },
        ],
      }),
    ],
    exercises: [
      E({ id: 'g15-e1', order_num: 1, type: 'word_order', prompt_en: 'Build: "I go to China by plane."', prompt_ar: 'كوّن: "أسافر إلى الصين بالطائرة."', words: ['我', '坐', '飞机', '去', '中国', '。'], correct: '我坐飞机去中国。', correct_pinyin: 'Wǒ zuò fēijī qù Zhōngguó.' }),
      E({ id: 'g15-e2', order_num: 2, type: 'context_choice', prompt_en: 'Which order is correct?', prompt_ar: 'أي ترتيب صحيح؟', options: ['我坐火车去北京。', '我去北京坐火车。'], correct: '我坐火车去北京。', correct_pinyin: 'Wǒ zuò huǒchē qù Běijīng.', explanation_en: 'Board first, then go.', explanation_ar: 'تركب أولاً ثم تذهب.' }),
      E({ id: 'g15-e3', order_num: 3, type: 'transform_question', prompt_en: 'Turn into a question: 你坐飞机去中国。', prompt_ar: 'حوّلها إلى سؤال: 你坐飞机去中国。', chinese: '你坐飞机去中国。', options: ['你坐飞机去中国吗？', '吗你坐飞机去中国？', '你坐吗飞机去中国？'], correct: '你坐飞机去中国吗？', correct_pinyin: 'Nǐ zuò fēijī qù Zhōngguó ma?', explanation_en: '吗 at the very end, as always.', explanation_ar: '吗 في نهاية الجملة كالعادة.' }),
    ],
  },
};

Object.assign(grammarFallback, part2);
export { grammarFallback };
