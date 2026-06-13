import { useState } from 'react';
import { recordMistake } from '@/lib/mistakes';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, Check, X, Volume2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import { savePlacement, todayStr } from '@/lib/gamification';

interface PQ {
  q_en: string; q_ar: string;
  chinese?: string;   // shown big
  audio?: string;     // listen question: TTS this
  options: string[];
  correct: string;
  pinyin?: string;    // shown after answer
}

// 20 fixed beginner questions: pinyin, tones, greetings, numbers, order, grammar, listening
const QUESTIONS: PQ[] = [
  { q_en: 'What is Pinyin?', q_ar: 'ما هو البينين؟', options: ['Chinese sounds in Latin letters / أصوات الصينية بحروف لاتينية', 'A Chinese dialect / لهجة صينية', 'Chinese calligraphy / الخط الصيني'], correct: 'Chinese sounds in Latin letters / أصوات الصينية بحروف لاتينية' },
  { q_en: 'Correct Pinyin for 你好:', q_ar: 'البينين الصحيح لـ 你好:', chinese: '你好', options: ['nǐ hǎo', 'ni hao (no tones are fine)', 'nì hào'], correct: 'nǐ hǎo' },
  { q_en: 'Which tone is mā (妈 mom)?', q_ar: 'أي نغمة في mā (妈 أم)؟', chinese: '妈', options: ['1st — high flat / الأولى', '3rd — falling-rising / الثالثة', '4th — sharp falling / الرابعة'], correct: '1st — high flat / الأولى', pinyin: 'mā' },
  { q_en: 'mǎ (3rd tone) means:', q_ar: 'mǎ (النغمة الثالثة) تعني:', chinese: '马', options: ['horse / حصان', 'mom / أم', 'scold / يوبخ'], correct: 'horse / حصان', pinyin: 'mǎ' },
  { q_en: 'Greeting a teacher politely:', q_ar: 'تحية المعلم بأدب:', options: ['您好', '你好', '再见'], correct: '您好', pinyin: 'nín hǎo' },
  { q_en: 'Reply to 谢谢:', q_ar: 'الرد على 谢谢:', chinese: '谢谢', options: ['不客气', '你好', '请坐'], correct: '不客气', pinyin: 'bú kèqi' },
  { q_en: '"Goodbye" is:', q_ar: '"مع السلامة" هي:', options: ['再见', '你好', '谢谢'], correct: '再见', pinyin: 'zàijiàn' },
  { q_en: 'The number 3:', q_ar: 'الرقم 3:', options: ['三', '二', '五'], correct: '三', pinyin: 'sān' },
  { q_en: 'The number 10:', q_ar: 'الرقم 10:', options: ['十', '一', '八'], correct: '十', pinyin: 'shí' },
  { q_en: '25 in Chinese:', q_ar: '25 بالصينية:', options: ['二十五', '五十二', '二五'], correct: '二十五', pinyin: 'èrshíwǔ' },
  { q_en: 'Correct order for "I am a student":', q_ar: 'الترتيب الصحيح لـ"أنا طالب":', options: ['我是学生', '学生是我', '是我学生'], correct: '我是学生', pinyin: 'wǒ shì xuésheng' },
  { q_en: 'Negate: 我是老师 →', q_ar: 'انفِ: 我是老师 ←', chinese: '我是老师', options: ['我不是老师', '我没是老师', '不我是老师'], correct: '我不是老师', pinyin: 'wǒ bú shì lǎoshī' },
  { q_en: 'Make a question: 你是学生 →', q_ar: 'حوّلها لسؤال: 你是学生 ←', chinese: '你是学生', options: ['你是学生吗？', '吗你是学生？', '你是吗学生？'], correct: '你是学生吗？', pinyin: 'nǐ shì xuésheng ma?' },
  { q_en: '"What" in Chinese:', q_ar: '"ماذا" بالصينية:', options: ['什么', '哪儿', '谁'], correct: '什么', pinyin: 'shénme' },
  { q_en: 'My name: 我___名字', q_ar: 'اسمي: 我___名字', chinese: '我 ___ 名字', options: ['的', '是', '吗'], correct: '的', pinyin: 'wǒ de míngzi' },
  { q_en: '"The weather is good":', q_ar: '"الطقس جيد":', options: ['天气很好', '天气是好', '好天气是'], correct: '天气很好', pinyin: 'tiānqì hěn hǎo' },
  { q_en: 'A cup of tea:', q_ar: 'كوب شاي:', options: ['一杯茶', '一本茶', '一个茶'], correct: '一杯茶', pinyin: 'yì bēi chá' },
  { q_en: 'Monday is:', q_ar: 'الاثنين هو:', options: ['星期一', '星期天', '一月'], correct: '星期一', pinyin: 'xīngqīyī' },
  { q_en: 'Listen — what did you hear?', q_ar: 'استمع — ماذا سمعت؟', audio: '谢谢', options: ['谢谢', '你好', '再见'], correct: '谢谢', pinyin: 'xièxie' },
  { q_en: 'Listen — what did you hear?', q_ar: 'استمع — ماذا سمعت؟', audio: '我想喝茶', options: ['我想喝茶', '我是学生', '今天很热'], correct: '我想喝茶', pinyin: 'wǒ xiǎng hē chá' },
];

function recommend(score: number): { key: string; link: string; linkLabel: string } {
  if (score <= 6) return { key: 'placement.recPinyin', link: '/pinyin', linkLabel: 'start.cta' };
  if (score <= 10) return { key: 'placement.recTones', link: '/tones', linkLabel: 'nav.tones' };
  if (score <= 14) return { key: 'placement.recLesson1', link: '/courses', linkLabel: 'courses.startLesson' };
  if (score <= 17) return { key: 'placement.recNumbers', link: '/essentials', linkLabel: 'nav.essentials' };
  return { key: 'placement.recLevel2', link: '/path', linkLabel: 'nav.path' };
}

/** V2.1 /placement-test — fixed local 20-question beginner placement */
export default function PlacementTest() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[index];

  const pick = (opt: string) => {
    if (picked !== null) return;
    setPicked(opt);
    if (opt === q.correct) setScore(s => s + 1);
    else recordMistake({
      source: 'placement',
      question: isAr ? q.q_ar : q.q_en,
      chinese: q.chinese,
      pinyin: q.pinyin,
      yourAnswer: opt,
      correctAnswer: q.correct,
      link: '/placement-test',
    });
  };

  const next = () => {
    if (index < QUESTIONS.length - 1) {
      setIndex(i => i + 1);
      setPicked(null);
    } else {
      const rec = recommend(score);
      savePlacement({ date: todayStr(), score, total: QUESTIONS.length, recommendation: rec.key });
      setFinished(true);
    }
  };

  if (finished) {
    const rec = recommend(score);
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="max-w-[600px] mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="liquid-glass p-10 text-center">
          <div className="w-24 h-24 rounded-full bg-[#FF3333]/15 flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-black text-2xl text-[#FF3333]">{pct}%</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">{t('placement.done')}</h2>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{score} / {QUESTIONS.length}</p>
          <p className={`text-base text-white mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
            {t('placement.recIntro')} <strong className="text-[#FF3333]">{t(rec.key)}</strong>
          </p>
          <Link to={rec.link} className="btn-primary text-sm py-3 px-6">{t(rec.linkLabel)} <ArrowRight size={15} /></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-3xl text-white mb-2 flex items-center gap-3">
          <ClipboardCheck className="text-[#FF3333]" /> {t('placement.title')}
        </h1>
        <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('placement.subtitle')}
        </p>
      </motion.div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-[#FF3333] rounded-full transition-all" style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="text-xs shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>{index + 1}/{QUESTIONS.length}</span>
      </div>

      <div className="liquid-glass p-6">
        <p className={`text-base text-white mb-4 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
          {isAr ? q.q_ar : q.q_en}
        </p>
        {q.chinese && <p className="font-chinese text-3xl text-white text-center mb-4">{q.chinese}</p>}
        {q.audio && (
          <button onClick={() => play(q.audio!)} className="w-16 h-16 rounded-full bg-[#FF3333] hover:bg-[#ff5555] flex items-center justify-center mx-auto mb-4 transition-colors">
            <Volume2 size={24} className="text-white" />
          </button>
        )}
        <div className="space-y-2">
          {q.options.map(opt => {
            let cls = 'w-full text-left p-3 rounded-xl border text-base transition-all ';
            if (picked !== null) {
              if (opt === q.correct) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
              else if (opt === picked) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
              else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
            } else {
              cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]';
            }
            return <button key={opt} onClick={() => pick(opt)} disabled={picked !== null} className={cls + ' font-chinese'}>{opt}</button>;
          })}
        </div>
        {picked !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mt-4">
            <span className="flex items-center gap-2 text-sm">
              {picked === q.correct
                ? <><Check size={15} className="text-[#10b981]" /><span className="text-[#10b981]">{t('grammar.correct')}</span></>
                : <><X size={15} className="text-[#FF3333]" /><span className="font-chinese text-white">{q.correct}</span></>}
              {q.pinyin && <PinyinText inline>{q.pinyin}</PinyinText>}
            </span>
            <button onClick={next} className="btn-primary text-sm py-2 px-4">
              {index < QUESTIONS.length - 1 ? t('listening.next') : t('listening.finish')}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
