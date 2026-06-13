import { useState } from 'react';
import PinyinText from '@/components/PinyinText';
import { motion } from 'framer-motion';
import { Hash, CalendarDays, Coins, Cake, BookOpenCheck, Brain, Volume2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import GrammarExerciseCard from '@/components/GrammarExerciseCard';
import TypePinyinExercise from '@/components/TypePinyinExercise';
import MatchingExercise from '@/components/MatchingExercise';
import CharacterMemoryCard from '@/components/CharacterMemoryCard';
import { hanziMemory } from '@/data/hanziMemory';
import { confusables, charFamilies } from '@/data/hanziExtra';
import StrokeOrderPlayer from '@/components/StrokeOrderPlayer';
import AudioButton from '@/components/AudioButton';
import type { GrammarExercise } from '@/types/grammar';

/**
 * V2.0.4 /essentials — textbook-style focused modules: numbers 0–100, days,
 * months, dates, asking age, asking price — each with rule explanation,
 * Chinese + pinyin + Arabic + English items, examples and mini exercises.
 * Frontend-only data; no database tables required.
 */

interface Item { zh: string; py: string; en: string; ar: string }

const NUMBERS: Item[] = [
  { zh: '〇/零', py: 'líng', en: '0', ar: '٠' }, { zh: '一', py: 'yī', en: '1', ar: '١' },
  { zh: '二', py: 'èr', en: '2', ar: '٢' }, { zh: '三', py: 'sān', en: '3', ar: '٣' },
  { zh: '四', py: 'sì', en: '4', ar: '٤' }, { zh: '五', py: 'wǔ', en: '5', ar: '٥' },
  { zh: '六', py: 'liù', en: '6', ar: '٦' }, { zh: '七', py: 'qī', en: '7', ar: '٧' },
  { zh: '八', py: 'bā', en: '8', ar: '٨' }, { zh: '九', py: 'jiǔ', en: '9', ar: '٩' },
  { zh: '十', py: 'shí', en: '10', ar: '١٠' }, { zh: '十一', py: 'shíyī', en: '11', ar: '١١' },
  { zh: '十二', py: "shí'èr", en: '12', ar: '١٢' }, { zh: '二十', py: 'èrshí', en: '20', ar: '٢٠' },
  { zh: '二十五', py: 'èrshíwǔ', en: '25', ar: '٢٥' }, { zh: '九十九', py: 'jiǔshíjiǔ', en: '99', ar: '٩٩' },
  { zh: '一百', py: 'yìbǎi', en: '100', ar: '١٠٠' },
];

const DAYS: Item[] = [
  { zh: '星期一', py: 'xīngqīyī', en: 'Monday', ar: 'الاثنين' },
  { zh: '星期二', py: "xīngqī'èr", en: 'Tuesday', ar: 'الثلاثاء' },
  { zh: '星期三', py: 'xīngqīsān', en: 'Wednesday', ar: 'الأربعاء' },
  { zh: '星期四', py: 'xīngqīsì', en: 'Thursday', ar: 'الخميس' },
  { zh: '星期五', py: 'xīngqīwǔ', en: 'Friday', ar: 'الجمعة' },
  { zh: '星期六', py: 'xīngqīliù', en: 'Saturday', ar: 'السبت' },
  { zh: '星期天 / 星期日', py: 'xīngqītiān / xīngqīrì', en: 'Sunday', ar: 'الأحد' },
];

const MONTHS: Item[] = Array.from({ length: 12 }, (_, i) => {
  const n = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][i];
  const p = ['yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ', 'shí', 'shíyī', "shí'èr"][i];
  const en = ['January','February','March','April','May','June','July','August','September','October','November','December'][i];
  const ar = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][i];
  return { zh: `${n}月`, py: `${p} yuè`, en, ar };
});

interface Section {
  key: string;
  icon: typeof Hash;
  rule_en: string;
  rule_ar: string;
  items?: Item[];
  examples: Item[];
  exercises: GrammarExercise[];
  typing?: { chinese: string; expected: string }[];
  matching?: { pairs: { left: string; right: string }[]; leftIsChinese: boolean };
}

const SECTIONS: Section[] = [
  {
    key: 'numbers', icon: Hash,
    rule_en: 'Numbers build logically: 11 = 十一 (ten-one), 20 = 二十 (two-ten), 25 = 二十五 (two-ten-five), 100 = 一百. Learn 0–10 and you can build everything to 99.',
    rule_ar: 'الأرقام تُبنى منطقياً: 11 = 十一 (عشرة-واحد)، 20 = 二十 (اثنان-عشرة)، 25 = 二十五 (اثنان-عشرة-خمسة)، 100 = 一百. احفظ 0–10 وستبني كل الأرقام حتى 99.',
    items: NUMBERS,
    examples: [
      { zh: '我有三本书。', py: 'wǒ yǒu sān běn shū.', en: 'I have three books.', ar: 'عندي ثلاثة كتب.' },
      { zh: '二十五个学生', py: 'èrshíwǔ gè xuésheng', en: '25 students', ar: '٢٥ طالباً' },
    ],
    exercises: [
      { id: 'es-n1', order_num: 1, type: 'fill_blank', prompt_en: 'How do you say 25?', prompt_ar: 'كيف تقول 25؟', options: ['二十五', '五十二', '二五'], correct: '二十五', correct_pinyin: 'èrshíwǔ', explanation_en: 'two-ten-five.', explanation_ar: 'اثنان-عشرة-خمسة.' },
      { id: 'es-n2', order_num: 2, type: 'fill_blank', prompt_en: 'How do you say 99?', prompt_ar: 'كيف تقول 99؟', options: ['九十九', '十九九', '九九十'], correct: '九十九', correct_pinyin: 'jiǔshíjiǔ', explanation_en: 'nine-ten-nine.', explanation_ar: 'تسعة-عشرة-تسعة.' },
    ],
    typing: [{ chinese: '十二', expected: "shí'èr" }],
  },
  {
    key: 'days', icon: CalendarDays,
    rule_en: 'Days = 星期 (week) + number: Monday is 星期一 (week-one) ... Saturday 星期六. Sunday is special: 星期天 or 星期日 — never 星期七.',
    rule_ar: 'الأيام = 星期 (أسبوع) + رقم: الاثنين 星期一 (أسبوع-واحد) ... السبت 星期六. والأحد خاص: 星期天 أو 星期日 — وليس 星期七 أبداً.',
    items: DAYS,
    examples: [
      { zh: '今天是星期五。', py: 'jīntiān shì xīngqīwǔ.', en: 'Today is Friday.', ar: 'اليوم الجمعة.' },
      { zh: '我星期一工作。', py: 'wǒ xīngqīyī gōngzuò.', en: 'I work on Monday.', ar: 'أعمل يوم الاثنين.' },
    ],
    exercises: [
      { id: 'es-d1', order_num: 1, type: 'fill_blank', prompt_en: 'Sunday is:', prompt_ar: 'الأحد هو:', options: ['星期天', '星期七', '星期零'], correct: '星期天', correct_pinyin: 'xīngqītiān', explanation_en: 'Sunday breaks the number pattern.', explanation_ar: 'الأحد يكسر نمط الأرقام.' },
    ],
    matching: {
      leftIsChinese: true,
      pairs: [
        { left: '星期一', right: 'Monday · الاثنين' },
        { left: '星期三', right: 'Wednesday · الأربعاء' },
        { left: '星期五', right: 'Friday · الجمعة' },
        { left: '星期天', right: 'Sunday · الأحد' },
      ],
    },
  },
  {
    key: 'months', icon: CalendarDays,
    rule_en: 'Months = number + 月 (moon/month): January is 一月, December is 十二月. No special names to memorize — just numbers!',
    rule_ar: 'الشهور = رقم + 月 (قمر/شهر): يناير 一月 وديسمبر 十二月. لا أسماء خاصة للحفظ — أرقام فقط!',
    items: MONTHS,
    examples: [
      { zh: '六月很热。', py: 'liù yuè hěn rè.', en: 'June is very hot.', ar: 'يونيو حار جداً.' },
    ],
    exercises: [
      { id: 'es-m1', order_num: 1, type: 'fill_blank', prompt_en: 'October is:', prompt_ar: 'أكتوبر هو:', options: ['十月', '八月', '四月'], correct: '十月', correct_pinyin: 'shí yuè', explanation_en: 'October = month 10.', explanation_ar: 'أكتوبر = الشهر العاشر.' },
    ],
    matching: {
      leftIsChinese: true,
      pairs: [
        { left: '一月', right: 'January · يناير' },
        { left: '五月', right: 'May · مايو' },
        { left: '九月', right: 'September · سبتمبر' },
        { left: '十二月', right: 'December · ديسمبر' },
      ],
    },
  },
  {
    key: 'dates', icon: CalendarDays,
    rule_en: 'Dates go big → small: year 年 → month 月 → day 号. "Today is June 12" = 今天是六月十二号。 Ask the date with 今天几号？',
    rule_ar: 'التواريخ من الأكبر إلى الأصغر: سنة 年 ← شهر 月 ← يوم 号. "اليوم 12 يونيو" = 今天是六月十二号。 واسأل عن التاريخ بـ 今天几号؟',
    examples: [
      { zh: '今天是六月十二号。', py: "jīntiān shì liù yuè shí'èr hào.", en: 'Today is June 12.', ar: 'اليوم ١٢ يونيو.' },
      { zh: '今天几号？', py: 'jīntiān jǐ hào?', en: 'What is the date today?', ar: 'كم التاريخ اليوم؟' },
    ],
    exercises: [
      { id: 'es-dt1', order_num: 1, type: 'word_order', prompt_en: 'Build: "Today is June 12."', prompt_ar: 'كوّن: "اليوم ١٢ يونيو."', words: ['今天', '是', '六月', '十二号', '。'], correct: '今天是六月十二号。', correct_pinyin: "Jīntiān shì liù yuè shí'èr hào." },
    ],
    typing: [{ chinese: '今天几号？', expected: 'jīntiān jǐ hào' }],
  },
  {
    key: 'age', icon: Cake,
    rule_en: 'Three ways to ask age: 你几岁？ (children, under ~10), 你多大？ (peers/adults), 您多大年纪？ (respectful, elders). Answer: number + 岁: 我二十五岁。',
    rule_ar: 'ثلاث طرق للسؤال عن العمر: 你几岁؟ (للأطفال)، 你多大؟ (للأقران والبالغين)، 您多大年纪؟ (باحترام لكبار السن). والإجابة: رقم + 岁: 我二十五岁。',
    examples: [
      { zh: '你多大？', py: 'nǐ duō dà?', en: 'How old are you? (adult)', ar: 'كم عمرك؟ (لبالغ)' },
      { zh: '我二十五岁。', py: 'wǒ èrshíwǔ suì.', en: 'I am 25 years old.', ar: 'عمري ٢٥ سنة.' },
    ],
    exercises: [
      { id: 'es-a1', order_num: 1, type: 'context_choice', prompt_en: 'Asking an elderly man his age respectfully:', prompt_ar: 'تسأل رجلاً كبيراً عن عمره باحترام:', options: ['您多大年纪？', '你几岁？'], correct: '您多大年纪？', correct_pinyin: 'Nín duō dà niánjì?', explanation_en: '几岁 is for children.', explanation_ar: '几岁 للأطفال.' },
      { id: 'es-a2', order_num: 2, type: 'word_order', prompt_en: 'Build: "I am 25 years old."', prompt_ar: 'كوّن: "عمري ٢٥ سنة."', words: ['我', '二十五', '岁', '。'], correct: '我二十五岁。', correct_pinyin: 'Wǒ èrshíwǔ suì.' },
    ],
  },
  {
    key: 'price', icon: Coins,
    rule_en: 'Ask prices with 多少钱: 这个多少钱？ Money units: 块 (kuài, spoken) / 元 (yuán, written). "13 yuan" = 十三块. Add the measure word for the item: 这件衣服多少钱？',
    rule_ar: 'اسأل عن السعر بـ多少钱: 这个多少钱؟ وحدات النقود: 块 (محكية) / 元 (مكتوبة). "13 يواناً" = 十三块. وأضف كلمة العدّ للسلعة: 这件衣服多少钱؟',
    examples: [
      { zh: '这个多少钱？', py: 'zhège duōshao qián?', en: 'How much is this?', ar: 'بكم هذا؟' },
      { zh: '十三块。', py: 'shísān kuài.', en: '13 yuan.', ar: '١٣ يواناً.' },
    ],
    exercises: [
      { id: 'es-p1', order_num: 1, type: 'fill_blank', prompt_en: 'How much is this? 这个 ___ 钱？', prompt_ar: 'بكم هذا؟ 这个 ___ 钱؟', chinese: '这个 ___ 钱？', options: ['多少', '几', '什么'], correct: '多少', correct_pinyin: 'Zhège duōshao qián?', explanation_en: 'Prices use 多少.', explanation_ar: 'الأسعار تستخدم 多少.' },
      { id: 'es-p2', order_num: 2, type: 'dialogue', prompt_en: 'A: 这个多少钱？ B: ___ (13 yuan)', prompt_ar: 'أ: 这个多少钱؟ ب: ___ (١٣ يواناً)', chinese: 'A: 这个多少钱？ B: ___', options: ['十三块。', '三十块。', '十三个。'], correct: '十三块。', correct_pinyin: 'Shísān kuài.', explanation_en: '十三 = 13 (三十 = 30); money uses 块.', explanation_ar: '十三 = ١٣ (و三十 = ٣٠)؛ والنقود بـ块.' },
    ],
  },
];

export default function Essentials() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [open, setOpen] = useState<string>('numbers');
  const [strokeChar, setStrokeChar] = useState<string>('好');

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <BookOpenCheck className="text-[#FF3333]" /> {t('essentials.title')}
        </h1>
        <p className={`text-sm mb-8 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('essentials.subtitle')}
        </p>
      </motion.div>

      {/* Section selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setOpen(s.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${open === s.key ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'}`}>
            <s.icon size={15} /> {t(`essentials.${s.key}`)}
          </button>
        ))}
        <button onClick={() => setOpen('hanzi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${open === 'hanzi' ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'}`}>
          <Brain size={15} /> {t('essentials.hanzi')}
        </button>
      </div>

      {/* Character memory gallery */}
      {open === 'hanzi' && (
        <motion.div key="hanzi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-sm mb-5 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
            {t('hanzi.intro')}
          </p>
          {/* V2.0.5: stroke-order studio */}
          <div className="liquid-glass p-6 mb-6">
            <h3 className="font-display font-bold text-lg text-white mb-1">{t('stroke.title')}</h3>
            <p className={`text-xs mb-4 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>{t('stroke.intro')}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {hanziMemory.map(h => (
                <button key={h.char} onClick={() => setStrokeChar(h.char)}
                  className={`px-3 py-1.5 rounded-lg font-chinese text-xl transition-colors ${strokeChar === h.char ? 'bg-[#FF3333] text-white' : 'bg-white/[0.05] text-white hover:bg-[#FF3333]/20'}`}>
                  {h.char}
                </button>
              ))}
            </div>
            <StrokeOrderPlayer key={strokeChar} character={strokeChar} size={240} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {hanziMemory.map(h => <CharacterMemoryCard key={h.char} item={h} />)}
          </div>

          {/* V2.0.5: character families */}
          <h3 className="font-display font-bold text-lg text-white mb-3">{t('hanzi.families')}</h3>
          <div className="space-y-3 mb-8">
            {charFamilies.map(f => (
              <div key={f.title_en} className="liquid-glass p-5">
                <p className="text-sm font-display font-semibold text-white mb-3">{isAr ? f.title_ar : f.title_en}</p>
                <div className="flex items-center justify-center gap-3 flex-wrap mb-3">
                  {f.steps.map((st, i) => (
                    <span key={st.char} className="inline-flex items-center gap-3">
                      {i > 0 && <span className="text-[#FF3333] text-xl">→</span>}
                      <span className="inline-flex flex-col items-center">
                        <span className="font-chinese text-3xl text-white">{st.char}</span>
                        <PinyinText inline>{st.pinyin}</PinyinText>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? st.meaning_ar : st.meaning_en}</span>
                      </span>
                      <AudioButton text={st.char} size="sm" />
                    </span>
                  ))}
                </div>
                <p className={`text-xs ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? f.note_ar : f.note_en}</p>
              </div>
            ))}
          </div>

          {/* V2.0.5: confusable characters */}
          <h3 className="font-display font-bold text-lg text-white mb-3">{t('hanzi.confusables')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {confusables.map(c => (
              <div key={c.a + c.b} className="liquid-glass p-4">
                <div className="flex items-center justify-center gap-6 mb-2">
                  <span className="text-center">
                    <span className="font-chinese text-4xl text-white block">{c.a}</span>
                    <PinyinText>{c.a_pinyin}</PinyinText>
                    <span className="text-[10px] block" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? c.a_meaning_ar : c.a_meaning_en}</span>
                  </span>
                  <span className="text-[#f59e0b] font-bold">≠</span>
                  <span className="text-center">
                    <span className="font-chinese text-4xl text-white block">{c.b}</span>
                    <PinyinText>{c.b_pinyin}</PinyinText>
                    <span className="text-[10px] block" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? c.b_meaning_ar : c.b_meaning_en}</span>
                  </span>
                </div>
                <p className={`text-xs ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-tertiary)' }}>💡 {isAr ? c.tip_ar : c.tip_en}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Topic sections */}
      {SECTIONS.filter(s => s.key === open).map(s => (
        <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Rule */}
          <div className="liquid-glass p-5 mb-5">
            <p className="text-xs font-display font-semibold uppercase mb-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('essentials.rule')}</p>
            <p className={`text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
              {isAr ? s.rule_ar : s.rule_en}
            </p>
          </div>

          {/* Items grid */}
          {s.items && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
              {s.items.map(it => (
                <button key={it.zh} onClick={() => play(it.zh)} className="rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#FF3333]/40 p-3 text-center transition-colors">
                  <div className="font-chinese text-xl text-white">{it.zh}</div>
                  <PinyinText className="text-center">{it.py}</PinyinText>
                  <div className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? it.ar : it.en}</div>
                </button>
              ))}
            </div>
          )}

          {/* Examples */}
          <div className="space-y-2 mb-6">
            {s.examples.map(ex => (
              <div key={ex.zh} className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/5 p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-chinese text-lg text-white">{ex.zh}</p>
                  <PinyinText size="base">{ex.py}</PinyinText>
                  <p className="text-xs font-arabic" dir="rtl" style={{ color: 'var(--color-text-secondary)' }}>{ex.ar}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{ex.en}</p>
                </div>
                <button onClick={() => play(ex.zh)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF3333]/40 flex items-center justify-center text-white transition-colors shrink-0">
                  <Volume2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Mini exercises */}
          <h3 className="font-display font-bold text-lg text-white mb-3">{t('grammar.practice')}</h3>
          <div className="space-y-4">
            {s.exercises.map(ex => (
              <div key={ex.id} className="liquid-glass p-5">
                <GrammarExerciseCard exercise={ex} />
              </div>
            ))}
            {s.matching && (
              <div className="liquid-glass p-5">
                <MatchingExercise pairs={s.matching.pairs} leftIsChinese={s.matching.leftIsChinese}
                  promptEn="Match the pairs:" promptAr="طابق الأزواج:" />
              </div>
            )}
            {s.typing?.map(ty => (
              <div key={ty.chinese} className="liquid-glass p-5">
                <TypePinyinExercise chinese={ty.chinese} expected={ty.expected} promptEn="Write the Pinyin:" promptAr="اكتب البينين:" />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
