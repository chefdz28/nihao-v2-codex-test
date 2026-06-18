import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Check, X, Zap, Star, RotateCcw, ArrowLeft, Trophy, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFlashcardGame } from '@/hooks/useFlashcardGame';
import { trackEvent } from '@/lib/analytics';
import Seo from '@/components/Seo';

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export const FlashcardPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || null;
  const g = useFlashcardGame(userId);

  useEffect(() => {
    trackEvent('flashcard_game_view', {});
    g.loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // speak the character automatically when a new question appears
  useEffect(() => {
    if (g.current && g.selected === null) speak(g.current.card.chinese);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.current?.card.id]);

  useEffect(() => {
    if (g.isComplete) trackEvent('flashcard_game_complete', { xp: g.xpEarned, accuracy: g.accuracy, maxCombo: g.maxCombo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.isComplete]);

  // ---- loading ----
  if (g.isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" dir="rtl">
        <Seo />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF3333] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-arabic" style={{ color: 'var(--color-text-secondary)' }}>جارٍ تحضير البطاقات…</p>
        </div>
      </div>
    );
  }

  // ---- no content ----
  if (!g.current && !g.isComplete) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6" dir="rtl">
        <Seo />
        <div className="text-center">
          <p className="font-arabic mb-4" style={{ color: 'var(--color-text-secondary)' }}>لا توجد بطاقات متاحة بعد.</p>
          <Link to="/dashboard" className="text-[#FF6666] font-arabic inline-flex items-center gap-1"><ArrowLeft size={15} /> لوحتي</Link>
        </div>
      </div>
    );
  }

  // ---- result screen ----
  if (g.isComplete) {
    const total = g.correctAnswers + g.wrongAnswers;
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-10" dir="rtl">
        <Seo />
        <div className="liquid-glass rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FF3333]/15 flex items-center justify-center mx-auto mb-4">
            <Trophy size={30} className="text-[#FF3333]" />
          </div>
          <h1 className="font-display font-black text-2xl text-white mb-1">أحسنت! 🎉</h1>
          <p className="font-arabic mb-6" style={{ color: 'var(--color-text-tertiary)' }}>أنهيت الجلسة</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="font-display font-black text-2xl text-[#FF3333]">+{g.xpEarned}</p>
              <p className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>نقطة خبرة</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="font-display font-black text-2xl text-[#FFD700]">{g.coinsEarned}</p>
              <p className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>عملة</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="font-display font-black text-2xl text-[#10b981]">{g.accuracy}%</p>
              <p className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>الدقّة ({g.correctAnswers}/{total})</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="font-display font-black text-2xl text-white flex items-center justify-center gap-1"><Flame size={20} className="text-[#FF6666]" />{g.maxCombo}</p>
              <p className="text-xs font-arabic" style={{ color: 'var(--color-text-tertiary)' }}>أفضل تتابع</p>
            </div>
          </div>

          <button onClick={g.loadGame} className="btn-primary w-full py-3 font-arabic mb-3 inline-flex items-center justify-center gap-2">
            <RotateCcw size={17} /> جلسة جديدة
          </button>
          <Link to="/dashboard" className="text-sm font-arabic text-[#FF6666] inline-flex items-center gap-1"><ArrowLeft size={14} /> العودة للوحة</Link>
        </div>
      </div>
    );
  }

  // ---- active question ----
  const q = g.current!;
  const answered = g.selected !== null;

  const optionClass = (i: number) => {
    if (!answered) return 'bg-[#161616] border-white/10 hover:border-[#FF3333]/40 hover:bg-white/[0.04]';
    if (i === q.correctIndex) return 'bg-[#10b981]/15 border-[#10b981] text-white';
    if (i === g.selected) return 'bg-[#FF3333]/15 border-[#FF3333] text-white';
    return 'bg-[#161616] border-white/10 opacity-50';
  };

  return (
    <div className="max-w-md mx-auto px-5 py-6" dir="rtl">
      <Seo />

      {/* top bar: progress + XP + combo */}
      <div className="flex items-center justify-between mb-5">
        <Link to="/dashboard" aria-label="خروج" className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08]"><X size={17} className="text-white" /></Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm font-display font-bold text-[#FF3333]"><Zap size={15} /> {g.xpEarned}</span>
          {g.combo >= 2 && <span className="flex items-center gap-1 text-sm font-display font-bold text-[#FF6666]"><Flame size={15} /> {g.combo}</span>}
        </div>
      </div>

      {/* progress bar */}
      <div className="h-2 rounded-full bg-white/[0.06] mb-1 overflow-hidden">
        <div className="h-full bg-[#FF3333] rounded-full transition-all duration-300" style={{ width: `${(g.questionNumber / g.totalQuestions) * 100}%` }} />
      </div>
      <p className="text-[11px] font-arabic mb-6 text-center" style={{ color: 'var(--color-text-tertiary)' }}>{g.questionNumber} / {g.totalQuestions}</p>

      {/* prompt */}
      <p className="text-center font-arabic text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>وش معنى هذه الكلمة؟</p>

      {/* the character card */}
      <div className="liquid-glass rounded-3xl p-8 mb-3 text-center">
        <p className="font-display font-black text-white mb-2" style={{ fontSize: 'clamp(3rem, 14vw, 5rem)', lineHeight: 1 }}>{q.card.chinese}</p>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)', direction: 'ltr' }}>{q.card.pinyin}</p>
        <button onClick={() => speak(q.card.chinese)} aria-label="استمع" className="mt-3 w-10 h-10 rounded-full bg-[#FF3333]/15 hover:bg-[#FF3333]/25 flex items-center justify-center mx-auto transition-colors">
          <Volume2 size={18} className="text-[#FF3333]" />
        </button>
      </div>

      {/* 4 options */}
      <div className="grid grid-cols-1 gap-2.5 mb-4">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => g.answer(i)}
            disabled={answered}
            className={`relative w-full py-3.5 px-4 rounded-2xl border text-white font-arabic text-base text-center transition-all ${optionClass(i)}`}
          >
            {opt}
            {answered && i === q.correctIndex && <Check size={18} className="text-[#10b981] absolute left-4 top-1/2 -translate-y-1/2" />}
            {answered && i === g.selected && i !== q.correctIndex && <X size={18} className="text-[#FF3333] absolute left-4 top-1/2 -translate-y-1/2" />}
          </button>
        ))}
      </div>

      {/* feedback + next */}
      {answered && (
        <div className="text-center">
          {g.isCorrect ? (
            <p className="font-arabic text-[#10b981] font-bold mb-3 flex items-center justify-center gap-1.5"><Star size={16} /> صحيح! +{10}{g.combo % 3 === 0 ? ' (+5 مكافأة تتابع)' : ''}</p>
          ) : (
            <p className="font-arabic text-[#FF6666] mb-3">الإجابة الصحيحة: <span className="font-bold text-white">{q.card.arabic}</span></p>
          )}
          <button onClick={g.next} className="btn-primary w-full py-3 font-arabic">
            {g.questionNumber >= g.totalQuestions ? 'إنهاء الجلسة' : 'التالي'}
          </button>
        </div>
      )}
    </div>
  );
};
