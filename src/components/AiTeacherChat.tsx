import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePinyinMode } from '@/hooks/usePinyinMode';
import AiTeacherPlanCard from '@/components/AiTeacherPlanCard';
import AiTeacherMiniQuiz from '@/components/AiTeacherMiniQuiz';
import { markCompleted } from '@/lib/studentProgress';
import { searchKnowledge, filterKnowledgeResultsForIntent, type KnowledgeResult } from '@/lib/aiTeacherKnowledge';
import { trackEvent } from '@/lib/analytics';
import {
  generateTeacherPlan, detectIntent, extractKnowledgeQuery, LEVEL_LABEL,
  type TeacherLevel, type TeacherGoal, type TeacherPlan, type TeacherRoute,
} from '@/lib/aiTeacher';

// ---- message model ----
type Msg =
  | { id: number; role: 'teacher' | 'student'; type: 'text'; text: string }
  | { id: number; role: 'teacher'; type: 'plan'; plan: TeacherPlan }
  | { id: number; role: 'teacher'; type: 'quiz'; plan: TeacherPlan }
  | { id: number; role: 'teacher'; type: 'links'; text: string; links: TeacherRoute[] }
  | { id: number; role: 'teacher'; type: 'knowledgeResults'; text: string; results: KnowledgeResult[] };

// same union without the id (distributes correctly, unlike Omit<Msg,'id'>)
type MsgInput =
  | { role: 'teacher' | 'student'; type: 'text'; text: string }
  | { role: 'teacher'; type: 'plan'; plan: TeacherPlan }
  | { role: 'teacher'; type: 'quiz'; plan: TeacherPlan }
  | { role: 'teacher'; type: 'links'; text: string; links: TeacherRoute[] }
  | { role: 'teacher'; type: 'knowledgeResults'; text: string; results: KnowledgeResult[] };

const SUGGESTIONS = [
  'أعطني خطة اليوم',
  'اختبرني HSK1',
  'اشرح لي pinyin',
  'أعطني 3 كلمات جديدة',
  'دربني على النغمات',
  'راجع أخطائي',
];

const LEVEL_CHIPS: { key: TeacherLevel; label: string }[] = [
  { key: 'beginner', label: 'مبتدئ' }, { key: 'hsk1', label: 'HSK1' },
  { key: 'hsk2', label: 'HSK2' }, { key: 'hsk3', label: 'HSK3' },
];

const TYPE_LABEL: Record<string, string> = {
  word: 'كلمة', grammar: 'قاعدة', article: 'مقال', story: 'قصة', lesson: 'درس', writing: 'كتابة',
};

let MID = 0;
const nid = () => ++MID;

/** V3.7.1 — chat-style AI Teacher. Deterministic replies (no API). */
export default function AiTeacherChat() {
  const { isAuthenticated } = useAuth();
  const { isVisible: pinyinIsVisible } = usePinyinMode();
  const [level, setLevel] = useState<TeacherLevel>('beginner');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { id: nid(), role: 'teacher', type: 'text', text: 'أهلاً! أنا معلمك الذكي في NiHao. اختر مستواك وهدفك، أو اسألني عن كلمة أو اختبار أو بينين.' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

  const push = (m: MsgInput) => setMessages(prev => [...prev, { ...m, id: nid() } as Msg]);

  // turn an intent into one or more teacher messages (all deterministic)
  const reply = (text: string) => {
    const intent = detectIntent(text);
    const useLevel: TeacherLevel = intent.level || level;
    if (intent.level && intent.level !== level) setLevel(intent.level);

    // V3.8.1 — high-priority knowledge search (meaning/translation/single word/Chinese)
    if (intent.action === 'search' || intent.action === 'help') {
      const target = extractKnowledgeQuery(text);
      const raw = searchKnowledge(target, 5);
      // V3.8.2 — for direct meaning questions, show only the strongest result(s)
      const results = filterKnowledgeResultsForIntent(text, target, raw);
      trackEvent('ai_teacher_knowledge_search', { hits: results.length });
      if (results.length > 0) {
        const top = results[0];
        let intro = 'وجدت لك هذا في بيانات NiHao:';
        if (top.type === 'word' && top.chinese) {
          // direct, natural answer for a strong word match
          intro = `${target} بالصينية هي ${top.chinese}، وتُنطق ${top.pinyin || ''}، ومعناها «${top.arabic}».`;
        } else if (top.type === 'grammar') {
          intro = 'هذي قاعدة نحوية مرتبطة بسؤالك:';
        } else if (top.type === 'story') {
          intro = 'وجدت قصة مناسبة:';
        }
        push({ role: 'teacher', type: 'knowledgeResults', text: intro, results });
        return;
      }
      // no match → deterministic fallback
      push({
        role: 'teacher', type: 'links',
        text: 'لم أجد نتيجة دقيقة في بيانات NiHao، لكن أقدر أساعدك بهذه الخيارات:',
        links: [
          { label: 'خطة اليوم', href: '#خطة' },
          { label: 'اختبار HSK', href: '/hsk-tests' },
          { label: 'القاموس', href: '/dictionary' },
          { label: 'تدريب الكتابة', href: '/writing-practice' },
          { label: 'البينين', href: '/pinyin' },
        ],
      });
      return;
    }

    if (intent.action === 'pinyin') {
      push({
        role: 'teacher', type: 'links',
        text: 'البينين هو طريقة كتابة نطق الحروف الصينية بأحرف لاتينية مع علامات النغمة (مثل nǐ hǎo). أفضل طريقة: اقرأ الكلمة وانطقها مع الاستماع. ابدأ من دليل البينين أو القاموس:',
        links: [{ label: 'دليل البينين', href: '/pinyin' }, { label: 'القاموس', href: '/dictionary' }],
      });
      return;
    }
    if (intent.action === 'tones') {
      push({
        role: 'teacher', type: 'links',
        text: 'للصينية أربع نغمات أساسية + نغمة خفيفة، وتغيّر النغمة يغيّر المعنى. تدرّب عليها بالاستماع والتكرار:',
        links: [{ label: 'مدرّب النغمات', href: '/tones' }, { label: 'دليل البينين', href: '/pinyin' }],
      });
      return;
    }
    if (intent.action === 'writing') {
      push({
        role: 'teacher', type: 'links',
        text: 'تعلّم كتابة الأحرف يثبّتها في ذاكرتك. تدرّب على ترتيب الرسم ثم اطبع ورقة عمل:',
        links: [{ label: 'تدريب الكتابة', href: '/writing-practice' }, { label: 'ورقة عمل HSK3', href: '/worksheets/hsk3' }],
      });
      return;
    }

    // plan / words / quiz / review → generate a plan, then show the right card
    const goal: TeacherGoal = intent.goal || 'daily_words';
    const plan = generateTeacherPlan({ level: useLevel, goal });
    trackEvent('ai_teacher_plan_generated', { level: useLevel, goal });
    if (isAuthenticated) void markCompleted('quiz', 'ai-teacher-plan-' + useLevel);

    if (intent.action === 'quiz' || intent.action === 'review') {
      push({ role: 'teacher', type: 'text', text: `تمام! هذا اختبار سريع لمستوى ${LEVEL_LABEL[useLevel]}. جاوب وبشوف نتيجتك فوراً.` });
      push({ role: 'teacher', type: 'quiz', plan });
    } else if (intent.action === 'words') {
      push({ role: 'teacher', type: 'text', text: `إليك ٣ كلمات لمستوى ${LEVEL_LABEL[useLevel]} اليوم:` });
      push({ role: 'teacher', type: 'plan', plan });
    } else {
      push({ role: 'teacher', type: 'text', text: `جهّزت لك خطة ${LEVEL_LABEL[useLevel]} لليوم 👇` });
      push({ role: 'teacher', type: 'plan', plan });
    }
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    push({ role: 'student', type: 'text', text: t });
    trackEvent('ai_teacher_chat_message', {});
    setInput('');
    // tiny delay so the student bubble paints first (feels conversational)
    setTimeout(() => reply(t), 150);
  };

  const onQuizComplete = (score: number, lvl: TeacherLevel) => {
    trackEvent('ai_teacher_quiz_completed', { level: lvl, score });
    if (isAuthenticated) void markCompleted('quiz', 'ai-teacher-quiz-' + lvl, score);
  };

  return (
    <div className="flex flex-col" dir="rtl" style={{ minHeight: '70vh' }}>
      {/* chat header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
        <div className="w-11 h-11 rounded-full bg-[#FF3333]/15 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-[#FF3333]" />
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-base">المعلم الذكي</h2>
          <p className="text-[11px] font-arabic flex items-center gap-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block" /> جاهز لمساعدتك في تعلّم الصينية
          </p>
        </div>
      </div>

      {/* level quick chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {LEVEL_CHIPS.map(c => (
          <button
            key={c.key}
            onClick={() => setLevel(c.key)}
            aria-pressed={level === c.key}
            className={`text-xs font-arabic px-3 py-1.5 rounded-full border transition-colors ${level === c.key ? 'bg-[#FF3333] text-white border-[#FF3333]' : 'bg-white/[0.03] text-white border-white/10 hover:bg-white/[0.06]'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* messages */}
      <div className="flex-1 space-y-4 mb-4">
        {messages.map(m => {
          if (m.role === 'student') {
            return (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[85%] bg-[#FF3333] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-arabic">
                  {m.type === 'text' ? m.text : ''}
                </div>
              </div>
            );
          }
          // teacher
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[92%] w-full">
                {m.type === 'text' && (
                  <div className="inline-block liquid-glass rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm font-arabic text-white">{m.text}</div>
                )}
                {m.type === 'links' && (
                  <div className="liquid-glass rounded-2xl rounded-tl-sm p-4">
                    <p className="text-sm font-arabic text-white mb-3">{m.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {m.links.map(l => l.href.startsWith('#') ? (
                        <button key={l.label} onClick={() => send('أعطني خطة اليوم')} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs font-arabic text-white hover:border-[#FF3333]/30 transition-colors">{l.label}</button>
                      ) : (
                        <Link key={l.href} to={l.href} onClick={() => trackEvent('ai_teacher_recommended_link_click', { href: l.href })} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs font-arabic text-white hover:border-[#FF3333]/30 transition-colors flex items-center gap-1.5">{l.label} <ArrowLeft size={12} className="text-[#FF3333]" /></Link>
                      ))}
                    </div>
                  </div>
                )}
                {m.type === 'plan' && (
                  <div className="liquid-glass rounded-2xl rounded-tl-sm p-1">
                    <AiTeacherPlanCard plan={m.plan} showPinyin={pinyinIsVisible((m.plan.level === 'hsk2' ? 2 : m.plan.level === 'hsk3' ? 3 : 1) as 1 | 2 | 3)} />
                  </div>
                )}
                {m.type === 'quiz' && (
                  <div className="liquid-glass rounded-2xl rounded-tl-sm p-4">
                    <AiTeacherMiniQuiz quiz={m.plan.quiz} onComplete={(s) => onQuizComplete(s, m.plan.level)} />
                  </div>
                )}
                {m.type === 'knowledgeResults' && (
                  <div className="liquid-glass rounded-2xl rounded-tl-sm p-4">
                    <p className="text-sm font-arabic text-white mb-3">{m.text}</p>
                    <div className="space-y-2">
                      {m.results.map((r, ri) => {
                        const card = (
                          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 hover:border-[#FF3333]/30 transition-colors">
                            <div className="flex items-center gap-2 flex-wrap">
                              {r.chinese && <span className="font-chinese text-lg text-white">{r.chinese}</span>}
                              {r.pinyin && pinyinIsVisible((r.hsk as 1 | 2 | 3) || 1) && <span className="text-xs text-[#FF6666]" style={{ direction: 'ltr' }}>{r.pinyin}</span>}
                              {!r.chinese && <span className="text-sm font-arabic text-white">{r.title}</span>}
                              {r.hsk && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[#a0a0a0]">HSK{r.hsk}</span>}
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF3333]/10 text-[#FF6666] font-arabic">{TYPE_LABEL[r.type]}</span>
                            </div>
                            {r.arabic && <p className="text-xs font-arabic mt-1" style={{ color: 'var(--color-text-secondary)' }}>{r.arabic}</p>}
                            {r.route && <span className="text-[11px] text-[#FF6666] font-arabic mt-1 inline-flex items-center gap-1">افتح <ArrowLeft size={11} /></span>}
                          </div>
                        );
                        return r.route ? (
                          <Link key={ri} to={r.route} onClick={() => trackEvent('ai_teacher_knowledge_result_click', { type: r.type })}>{card}</Link>
                        ) : <div key={ri}>{card}</div>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* suggested prompt chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => { trackEvent('ai_teacher_prompt_clicked', {}); send(s); }}
            className="text-[11px] font-arabic px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#ccc] hover:text-white hover:border-[#FF3333]/30 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* input */}
      <div className="flex items-center gap-2 sticky bottom-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(input); }}
          placeholder="اسأل المعلم الذكي… مثال: أعطني كلمات HSK1 اليوم"
          aria-label="اسأل المعلم الذكي"
          className="flex-1 min-w-0 bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none font-arabic focus:border-[#FF3333]/40"
        />
        <button onClick={() => send(input)} aria-label="إرسال" className="w-11 h-11 rounded-xl bg-[#FF3333] text-white flex items-center justify-center shrink-0 hover:bg-[#e02020] transition-colors">
          <Send size={18} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}
