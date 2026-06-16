import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timer, Volume2, Check, X, ClipboardList, RotateCcw } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useTestGate } from '@/hooks/useTestGate';
import { usePinyinMode } from '@/hooks/usePinyinMode';
import PinyinToggle from '@/components/PinyinToggle';
import AuthGate from '@/components/AuthGate';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import PinyinAnswerOption from '@/components/PinyinAnswerOption';
import { HSK3_QUESTIONS, HSK3_PASS_PCT, HSK3_TIME_MINUTES, type Hsk3Q } from '@/data/hsk3sim';
import { recordMistake } from '@/lib/mistakes';
import { awardXP } from '@/lib/gamification';
import { loadHskResultsByLevel, saveHskResultByLevel } from '@/lib/hskResults';


/** V3.2 /hsk3-simulation — HSK3 PRACTICE simulation (clearly not official) */
export default function Hsk3Simulation() {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const { gateOpen, requireAuth, closeGate } = useTestGate();
  const { mode: pinyinModeVal, setMode: setPinyinMode, isVisible: pinyinIsVisible } = usePinyinMode();

  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(HSK3_QUESTIONS.length).fill(null));
  const [secondsLeft, setSecondsLeft] = useState(HSK3_TIME_MINUTES * 60);
  const [reviewing, setReviewing] = useState(false);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q: Hsk3Q = HSK3_QUESTIONS[index];
  const score = answers.filter((a, i) => a === HSK3_QUESTIONS[i].correct).length;

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const start = () => {
    setPhase('test');
    setIndex(0);
    setAnswers(Array(HSK3_QUESTIONS.length).fill(null));
    setSecondsLeft(HSK3_TIME_MINUTES * 60);
    setReviewing(false);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { finish(); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAnswers(prev => {
      const finalScore = prev.filter((a, i) => a === HSK3_QUESTIONS[i].correct).length;
      const passed = (finalScore / HSK3_QUESTIONS.length) * 100 >= HSK3_PASS_PCT;
      const minutes = Math.round((Date.now() - startRef.current) / 60000);
      saveHskResultByLevel(3, { date: new Date().toISOString().slice(0, 10), score: finalScore, total: HSK3_QUESTIONS.length, passed, minutes });
      // wrong answers → mistake notebook
      prev.forEach((a, i) => {
        const qq = HSK3_QUESTIONS[i];
        if (a !== null && a !== qq.correct) {
          recordMistake({
            source: 'hsk3',
            question: isAr ? qq.q_ar : qq.q_en,
            chinese: qq.chinese || qq.audio,
            pinyin: qq.pinyin,
            yourAnswer: a,
            correctAnswer: qq.correct,
            link: '/hsk3-simulation',
          });
        }
      });
      awardXP(`hsk3_sim:${new Date().toISOString().slice(0, 10)}`, 40); // once per day (HSK3 harder)
      return prev;
    });
    setPhase('result');
  };

  const answer = (opt: string) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = opt;
      return next;
    });
  };

  const mmss = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  // ---------------- intro ----------------
  if (phase === 'intro') {
    const past = loadHskResultsByLevel(3);
    return (
      <div className="max-w-[640px] mx-auto px-6 py-10">
        {gateOpen && <AuthGate context={'hsk3_sim'} onClose={closeGate} />}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="liquid-glass p-8 text-center">
          <ClipboardList size={40} className="text-[#FF3333] mx-auto mb-4" />
          <h1 className="font-display font-black text-3xl text-white mb-2">{isAr ? 'محاكاة تدريبية لاختبار HSK3' : 'HSK3 Practice Simulation'}</h1>
          <p className={`text-xs mb-4 px-3 py-1.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] inline-block ${isAr ? 'font-arabic' : ''}`}>
            ⚠️ {isAr ? 'محاكاة تدريبية فقط — ليست اختبار HSK الرسمي' : 'Training simulation only — NOT an official HSK exam'}
          </p>
          <p className={`text-sm mb-6 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
            {isAr ? '40 سؤالاً بنمط HSK3: 20 استماعاً (اضغط للسماع) و20 قراءة. يمكنك التنقل بين الأسئلة وتغيير إجاباتك قبل التسليم.' : '40 questions in the style of HSK3: 20 listening (tap to hear) and 20 reading. Navigate freely and change answers before submitting.'}
          </p>
          <div className="flex justify-center gap-6 text-xs mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
            <span>🎧 20 {t('hsk.listening')}</span>
            <span>📖 20 {t('hsk.reading')}</span>
            <span>⏱ {HSK3_TIME_MINUTES} {t('hsk.minutes')}</span>
          </div>
          <div className="flex justify-center mb-5">
            <PinyinToggle mode={pinyinModeVal} onChange={setPinyinMode} hskLevel={3} compact />
          </div>
          <button onClick={() => requireAuth(start)} className="btn-primary text-sm py-3 px-8">{t('hsk.start')}</button>
          {past.length > 0 && (
            <div className="mt-6 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('hsk.lastResult')}: {past[past.length - 1].score}/{past[past.length - 1].total} · {past[past.length - 1].date}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ---------------- result ----------------
  if (phase === 'result') {
    const pct = Math.round((score / HSK3_QUESTIONS.length) * 100);
    const passed = pct >= HSK3_PASS_PCT;
    return (
      <div className="max-w-[700px] mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="liquid-glass p-8 text-center mb-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-[#10b981]/15' : 'bg-[#FF3333]/15'}`}>
            <span className={`font-display font-black text-2xl ${passed ? 'text-[#10b981]' : 'text-[#FF3333]'}`}>{pct}%</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-1">{passed ? t('hsk.passed') : t('hsk.failed')}</h2>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{score} / {HSK3_QUESTIONS.length} · {t('hsk.passMark')} {HSK3_PASS_PCT}%</p>
          <p className="text-xs text-[#f59e0b] mb-5">+40 XP</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setReviewing(r => !r)} className="btn-secondary text-sm">{reviewing ? t('hsk.hideReview') : t('hsk.review')}</button>
            <button onClick={start} className="btn-primary text-sm"><RotateCcw size={14} /> {t('hsk.retry')}</button>
            <Link to="/mistakes" className="btn-secondary text-sm">{t('mist.title')}</Link>
          </div>
        </motion.div>
        {reviewing && (
          <div className="space-y-2">
            {HSK3_QUESTIONS.map((qq, i) => {
              const a = answers[i];
              const ok = a === qq.correct;
              return (
                <div key={i} className={`liquid-glass p-3 rounded-xl border ${ok ? 'border-[#10b981]/20' : 'border-[#FF3333]/25'}`}>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    {ok ? <Check size={13} className="text-[#10b981]" /> : <X size={13} className="text-[#FF3333]" />}
                    <span style={{ color: 'var(--color-text-tertiary)' }}>{i + 1}. {qq.part === 'listening' ? '🎧' : '📖'}</span>
                    {qq.audio && <button onClick={() => play(qq.audio!)} className="text-[#888] hover:text-white"><Volume2 size={12} /></button>}
                  </div>
                  <p className={`text-sm text-white ${isAr ? 'font-arabic' : ''}`} dir="auto">{isAr ? qq.q_ar : qq.q_en} {qq.chinese && <span className="font-chinese">{qq.chinese}</span>}</p>
                  <p className="text-xs mt-1">
                    {!ok && a && <span className="text-[#FF3333] font-chinese me-3">✗ {a}</span>}
                    <span className="text-[#10b981] font-chinese">✓ {qq.correct}</span>
                    {qq.pinyin && pinyinIsVisible(3) && <PinyinText inline className="ms-2">{qq.pinyin}</PinyinText>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ---------------- test ----------------
  return (
    <div className="max-w-[640px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs px-3 py-1.5 rounded-full bg-white/5" style={{ color: 'var(--color-text-tertiary)' }}>
          {q.part === 'listening' ? `🎧 ${t('hsk.listening')}` : `📖 ${t('hsk.reading')}`} · {index + 1}/{HSK3_QUESTIONS.length}
        </span>
        <span className={`text-sm font-display font-bold flex items-center gap-1.5 ${secondsLeft < 120 ? 'text-[#FF3333]' : 'text-white'}`}>
          <Timer size={15} /> {mmss}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6">
        <div className="h-full bg-[#FF3333] rounded-full transition-all" style={{ width: `${((index + 1) / HSK3_QUESTIONS.length) * 100}%` }} />
      </div>

      <div className="liquid-glass p-6">
        <p className={`text-base text-white mb-4 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>{isAr ? q.q_ar : q.q_en}</p>
        {q.audio && (
          <button onClick={() => play(q.audio!)} className="w-16 h-16 rounded-full bg-[#FF3333] hover:bg-[#ff5555] flex items-center justify-center mx-auto mb-5 transition-colors">
            <Volume2 size={24} className="text-white" />
          </button>
        )}
        {q.chinese && (
          <div className="text-center mb-5">
            <p className="font-chinese text-3xl text-white">{q.chinese}</p>
            {pinyinIsVisible(3) && q.pinyin && <PinyinText className="text-sm mt-1 block">{q.pinyin}</PinyinText>}
          </div>
        )}
        <div className="space-y-2">
          {q.options.map(opt => (
            <button key={opt} onClick={() => answer(opt)}
              className={`w-full text-left p-3 rounded-xl border font-chinese text-base transition-all ${answers[index] === opt ? 'border-[#FF3333]/60 bg-[#FF3333]/15 text-white' : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]'}`}>
              <PinyinAnswerOption option={opt} showPinyin={pinyinIsVisible(3)} />
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-5">
          <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">{t('hsk.prev')}</button>
          {index < HSK3_QUESTIONS.length - 1 ? (
            <button onClick={() => setIndex(i => i + 1)} className="btn-primary text-sm py-2 px-4">{t('listening.next')}</button>
          ) : (
            <button onClick={finish} className="btn-primary text-sm py-2 px-5">{t('hsk.submit')}</button>
          )}
        </div>
        <p className="text-[10px] text-center mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
          {answers.filter(a => a !== null).length}/{HSK3_QUESTIONS.length} {t('hsk.answered')}
        </p>
      </div>
    </div>
  );
}
