import { useState } from 'react';
import JsonLd from '@/components/JsonLd';
import { learningResourceLd } from '@/lib/structuredData';
import { trackActivity, awardDailyXP, XP_REWARDS } from '@/lib/gamification';
import PinyinText from '@/components/PinyinText';
import { motion } from 'framer-motion';
import { Music4, Volume2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import TypePinyinExercise from '@/components/TypePinyinExercise';
import GrammarExerciseCard from '@/components/GrammarExerciseCard';
import type { GrammarExercise } from '@/types/grammar';

/**
 * V2.0.4 /pinyin — beginner Pinyin course: what pinyin is, initials, finals,
 * the 4 tones + neutral tone, tone marks, how tone changes meaning, audio
 * examples, common mistakes, and practice exercises (frontend-only data).
 */

const TONES = [
  { mark: 'mā', tone: 1, name_en: '1st — high & flat', name_ar: 'الأولى — عالية ومستوية', word: '妈', meaning_en: 'mom', meaning_ar: 'أم' },
  { mark: 'má', tone: 2, name_en: '2nd — rising', name_ar: 'الثانية — صاعدة', word: '麻', meaning_en: 'hemp', meaning_ar: 'قنّب' },
  { mark: 'mǎ', tone: 3, name_en: '3rd — falling-rising', name_ar: 'الثالثة — هابطة ثم صاعدة', word: '马', meaning_en: 'horse', meaning_ar: 'حصان' },
  { mark: 'mà', tone: 4, name_en: '4th — sharp falling', name_ar: 'الرابعة — هابطة حادة', word: '骂', meaning_en: 'to scold', meaning_ar: 'يوبّخ' },
  { mark: 'ma', tone: 0, name_en: 'Neutral — short & light', name_ar: 'محايدة — قصيرة وخفيفة', word: '吗', meaning_en: 'question particle', meaning_ar: 'أداة سؤال' },
];

const INITIALS = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
const FINALS = ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'ia', 'ie', 'iao', 'iu', 'in', 'ing', 'ua', 'uo', 'ui', 'un'];

const SOUND_DEMO: Record<string, string> = {
  b: '八', p: '怕', m: '妈', f: '飞', d: '大', t: '他', n: '你', l: '来',
  g: '哥', k: '看', h: '好', j: '叫', q: '请', x: '谢', zh: '中', ch: '吃',
  sh: '是', r: '人', z: '在', c: '菜', s: '三', y: '一', w: '我',
};

const EXAMPLES = [
  { chinese: '你好', pinyin: 'nǐ hǎo', en: 'hello', ar: 'مرحباً' },
  { chinese: '谢谢', pinyin: 'xièxie', en: 'thank you', ar: 'شكراً' },
  { chinese: '再见', pinyin: 'zài jiàn', en: 'goodbye', ar: 'مع السلامة' },
  { chinese: '我是学生', pinyin: 'wǒ shì xuésheng', en: 'I am a student', ar: 'أنا طالب' },
];

const MISTAKES = [
  { wrong: 'Reading pinyin like English letters', wrong_ar: 'قراءة البينين كحروف إنجليزية', fix_en: '"c" sounds like "ts" (菜 cài), "x" like a soft "sh" (谢 xiè), "q" like "ch" (请 qǐng), "zh" like "j" (中 zhōng).', fix_ar: '"c" تُنطق "تس" (菜 cài)، و"x" مثل "ش" ناعمة (谢 xiè)، و"q" مثل "تش" (请 qǐng)، و"zh" مثل "ج" (中 zhōng).' },
  { wrong: 'Ignoring tones', wrong_ar: 'تجاهل النغمات', fix_en: 'Tones change the meaning completely: mǎi 买 = buy, mài 卖 = sell. Always learn the tone with the word.', fix_ar: 'النغمات تغيّر المعنى كلياً: mǎi 买 = يشتري، mài 卖 = يبيع. احفظ النغمة مع الكلمة دائماً.' },
  { wrong: 'Confusing ü with u', wrong_ar: 'الخلط بين ü و u', fix_en: 'ü (as in 女 nǚ) is pronounced with rounded lips saying "ee". After j/q/x, the dots are dropped but the sound stays ü (去 qù).', fix_ar: 'ü (كما في 女 nǚ) تُنطق بشفتين مدوّرتين مع صوت "إي". بعد j/q/x تُحذف النقطتان لكن الصوت يبقى ü (去 qù).' },
];

const EXERCISES: GrammarExercise[] = [
  { id: 'py-1', order_num: 1, type: 'choose_pinyin', prompt_en: 'Choose the correct Pinyin for 中国', prompt_ar: 'اختر البينين الصحيح لكلمة 中国', chinese: '中国', options: ['zhōng guó', 'zōng gǔo', 'chōng guó'], correct: 'zhōng guó', explanation_en: 'zh = a "j"-like sound; guó has the 2nd (rising) tone.', explanation_ar: 'zh صوت يشبه "ج"، وguó بالنغمة الثانية الصاعدة.' },
  { id: 'py-2', order_num: 2, type: 'tone_choice', prompt_en: 'Which is "mom" (妈)?', prompt_ar: 'أيها تعني "أم" (妈)؟', chinese: '妈', options: ['mā', 'má', 'mǎ', 'mà'], correct: 'mā', explanation_en: '妈 takes the 1st tone — high and flat.', explanation_ar: '妈 بالنغمة الأولى — عالية ومستوية.' },
  { id: 'py-3', order_num: 3, type: 'tone_choice', prompt_en: 'Which is "horse" (马)?', prompt_ar: 'أيها تعني "حصان" (马)؟', chinese: '马', options: ['mā', 'má', 'mǎ', 'mà'], correct: 'mǎ', explanation_en: '马 takes the 3rd tone — dips down then rises.', explanation_ar: '马 بالنغمة الثالثة — تهبط ثم تصعد.' },
  { id: 'py-4', order_num: 4, type: 'choose_pinyin', prompt_en: 'Choose the correct Pinyin for 谢谢', prompt_ar: 'اختر البينين الصحيح لكلمة 谢谢', chinese: '谢谢', options: ['xièxie', 'shièshiè', 'jièjie'], correct: 'xièxie', explanation_en: 'x is a soft "sh"; the second syllable is neutral.', explanation_ar: 'x صوت "ش" ناعم؛ والمقطع الثاني بنغمة محايدة.' },
];

const Card = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="liquid-glass p-6 mb-6">
    <h2 className="font-display font-bold text-xl text-white mb-4">{title}</h2>
    {children}
  </div>
);

export default function Pinyin() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [showAllFinals, setShowAllFinals] = useState(false);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <JsonLd id="lr" data={learningResourceLd({ name: 'تعلم البينين والنغمات الصينية', description: 'درس مجاني لتعلم البينين والنغمات الصينية للناطقين بالعربية.', path: '/pinyin' })} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <Music4 className="text-[#FF3333]" /> {t('pinyin.title')}
        </h1>
        <p className={`text-sm mb-8 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('pinyin.subtitle')}
        </p>
      </motion.div>

      {/* What is pinyin */}
      <Card title={t('pinyin.whatTitle')}>
        <p className={`text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('pinyin.whatBody')}
        </p>
      </Card>

      {/* Tones */}
      <Card title={t('pinyin.tonesTitle')}>
        <p className={`text-sm mb-4 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('pinyin.tonesBody')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
          {TONES.map(tone => (
            <button key={tone.mark} onClick={() => play(tone.word)} className="rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#FF3333]/40 p-4 text-center transition-colors">
              <div className="text-2xl text-white font-semibold mb-1">{tone.mark}</div>
              <div className="font-chinese text-xl text-[#FF3333] mb-1">{tone.word}</div>
              <div className="text-[11px] leading-tight" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? tone.name_ar : tone.name_en}</div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? tone.meaning_ar : tone.meaning_en}</div>
              <Volume2 size={12} className="mx-auto mt-1 text-[#666]" />
            </button>
          ))}
        </div>
        <p className={`text-xs ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-tertiary)' }}>
          {t('pinyin.tonesMeaning')}
        </p>
      </Card>

      {/* Initials */}
      <Card title={t('pinyin.initialsTitle')}>
        <p className={`text-sm mb-3 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>{t('pinyin.initialsBody')}</p>
        <div className="flex flex-wrap gap-2" dir="ltr">
          {INITIALS.map(i => (
            <button key={i} onClick={() => SOUND_DEMO[i] && play(SOUND_DEMO[i])} className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm hover:bg-[#FF3333]/20 hover:border-[#FF3333]/30 transition-colors">
              {i}
            </button>
          ))}
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('pinyin.tapToHear')}</p>
      </Card>

      {/* Finals */}
      <Card title={t('pinyin.finalsTitle')}>
        <p className={`text-sm mb-3 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>{t('pinyin.finalsBody')}</p>
        <div className="flex flex-wrap gap-2" dir="ltr">
          {(showAllFinals ? FINALS : FINALS.slice(0, 15)).map(f => (
            <span key={f} className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm">{f}</span>
          ))}
        </div>
        <button onClick={() => setShowAllFinals(v => !v)} className="text-xs text-[#FF3333] mt-3 hover:underline">
          {showAllFinals ? t('pinyin.showLess') : t('pinyin.showMore')}
        </button>
      </Card>

      {/* Audio examples */}
      <Card title={t('pinyin.examplesTitle')}>
        <div className="space-y-2">
          {EXAMPLES.map(ex => (
            <div key={ex.chinese} className="flex items-center gap-4 rounded-xl bg-white/[0.02] border border-white/5 p-3">
              <span className="font-chinese text-2xl text-white w-32 shrink-0">{ex.chinese}</span>
              <div className="flex-1 min-w-0">
                <PinyinText size="base">{ex.pinyin}</PinyinText>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{isAr ? ex.ar : ex.en}</p>
              </div>
              <button onClick={() => play(ex.chinese)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#FF3333]/40 flex items-center justify-center text-white transition-colors">
                <Volume2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Common mistakes */}
      <Card title={t('pinyin.mistakesTitle')}>
        <div className="space-y-3">
          {MISTAKES.map((m, i) => (
            <div key={i} className="rounded-xl bg-[#FF3333]/5 border border-[#FF3333]/20 p-3">
              <p className={`text-sm text-[#FF3333] font-semibold mb-1 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
                {isAr ? m.wrong_ar : m.wrong}
              </p>
              <p className={`text-xs ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
                {isAr ? m.fix_ar : m.fix_en}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Practice */}
      <Card title={t('pinyin.practiceTitle')}>
        <div className="space-y-5">
          {EXERCISES.map(ex => (
            <div key={ex.id} className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <GrammarExerciseCard exercise={ex} onResult={() => { trackActivity('pinyin_sessions'); awardDailyXP('pinyin_practice', XP_REWARDS.pinyin_practice); }} />
            </div>
          ))}
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <TypePinyinExercise chinese="你好" expected="nǐ hǎo" promptEn="Write the Pinyin for:" promptAr="اكتب البينين لـ:" />
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <TypePinyinExercise chinese="我是学生。" expected="wǒ shì xuésheng" promptEn="Convert the sentence to Pinyin:" promptAr="حوّل الجملة إلى بينين:" />
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <TypePinyinExercise chinese="再见" expected="zài jiàn" promptEn="Listen and type the Pinyin:" promptAr="استمع واكتب البينين:" listenMode />
          </div>
        </div>
      </Card>
    </div>
  );
}
