import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { TeacherQuiz } from '@/lib/aiTeacher';

/** V3.7 — 3-question mini quiz with instant feedback. Calls onComplete once when
 *  all questions are answered. Keyboard-accessible buttons. */
export default function AiTeacherMiniQuiz({
  quiz,
  onComplete,
}: {
  quiz: TeacherQuiz[];
  onComplete?: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
  const [completed, setCompleted] = useState(false);

  const pick = (qi: number, choice: string) => {
    if (answers[qi] !== null) return; // lock after answering
    const next = [...answers];
    next[qi] = choice;
    setAnswers(next);
    if (next.every(a => a !== null) && !completed) {
      setCompleted(true);
      const score = next.filter((a, i) => a === quiz[i].answer).length;
      onComplete?.(score);
    }
  };

  const score = answers.filter((a, i) => a === quiz[i].answer).length;

  return (
    <div className="space-y-5" dir="rtl">
      {quiz.map((q, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi}>
            <p className="font-arabic text-white text-sm mb-2">{qi + 1}. {q.question}</p>
            <div className="grid gap-2">
              {q.choices.map(choice => {
                const isChosen = chosen === choice;
                const isCorrect = choice === q.answer;
                let cls = 'bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.06]';
                if (chosen !== null) {
                  if (isCorrect) cls = 'bg-[#10b981]/15 border-[#10b981]/40 text-white';
                  else if (isChosen) cls = 'bg-[#FF3333]/15 border-[#FF3333]/40 text-white';
                  else cls = 'bg-white/[0.02] border-white/5 text-[#888]';
                }
                return (
                  <button
                    key={choice}
                    onClick={() => pick(qi, choice)}
                    disabled={chosen !== null}
                    className={`w-full text-right px-4 py-3 rounded-xl border text-sm font-arabic transition-colors flex items-center justify-between ${cls}`}
                  >
                    <span>{choice}</span>
                    {chosen !== null && isCorrect && <Check size={16} className="text-[#10b981]" />}
                    {chosen !== null && isChosen && !isCorrect && <X size={16} className="text-[#FF3333]" />}
                  </button>
                );
              })}
            </div>
            {chosen !== null && (
              <p className="text-xs font-arabic mt-2 px-1" style={{ color: 'var(--color-text-tertiary)' }}>{q.explanation}</p>
            )}
          </div>
        );
      })}

      {completed && (
        <div className="liquid-glass rounded-xl p-4 text-center">
          <p className="font-display font-bold text-white">
            نتيجتك: {score} / {quiz.length}
          </p>
          <p className="text-xs font-arabic mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {score === quiz.length ? 'ممتاز! إجابات كاملة 🎉' : 'أحسنت — راجع الأخطاء وواصل التعلّم.'}
          </p>
        </div>
      )}
    </div>
  );
}
