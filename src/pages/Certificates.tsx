import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Lock, Check, Printer, X, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import PinyinText from '@/components/PinyinText';
import { STAGES, lessonsInStage } from '@/data/levels';
import { fetchLessons, fetchUserProgress } from '@/lib/dataService';
import { completedLessonIds } from '@/lib/learning';
import { awardXP } from '@/lib/gamification';
import type { LessonRow, UserProgressItem } from '@/types/supabase';

// ---------- local certificate state ----------
interface CertRecord { score: number; total: number; date: string }
const CERT_KEY = 'nihao_certs_v1';
function loadCerts(): Record<string, CertRecord> {
  try { return JSON.parse(window.localStorage.getItem(CERT_KEY) || '{}'); } catch { return {}; }
}
function saveCert(stageId: string, rec: CertRecord) {
  try {
    const all = loadCerts();
    all[stageId] = rec;
    window.localStorage.setItem(CERT_KEY, JSON.stringify(all));
  } catch { /* private mode */ }
}

// ---------- final tests (local, V2.2: Level 0 + Level 1; others coming soon) ----------
interface TQ { q_ar: string; q_en: string; chinese?: string; options: string[]; correct: string; pinyin?: string }

const TESTS: Record<string, TQ[]> = {
  stage0: [
    { q_ar: 'البينين هو:', q_en: 'Pinyin is:', options: ['كتابة الأصوات بحروف لاتينية', 'لهجة صينية', 'نوع خط'], correct: 'كتابة الأصوات بحروف لاتينية' },
    { q_ar: 'عدد النغمات الأساسية:', q_en: 'Number of main tones:', options: ['4', '2', '6'], correct: '4' },
    { q_ar: 'mā بالنغمة الأولى تعني:', q_en: 'mā (1st tone) means:', chinese: '妈', options: ['أم', 'حصان', 'يوبخ'], correct: 'أم', pinyin: 'mā' },
    { q_ar: 'mǎ بالنغمة الثالثة تعني:', q_en: 'mǎ (3rd tone) means:', chinese: '马', options: ['حصان', 'أم', 'قنّب'], correct: 'حصان', pinyin: 'mǎ' },
    { q_ar: 'البينين الصحيح لـ 你好:', q_en: 'Pinyin of 你好:', chinese: '你好', options: ['nǐ hǎo', 'nì hào', 'ni hao'], correct: 'nǐ hǎo' },
    { q_ar: 'صوت x في البينين يشبه:', q_en: 'x sounds like:', options: ['ش ناعمة', 'إكس', 'ز'], correct: 'ش ناعمة' },
    { q_ar: 'صوت zh يشبه:', q_en: 'zh sounds like:', options: ['ج', 'ز', 'تس'], correct: 'ج' },
    { q_ar: 'النغمة الرابعة:', q_en: 'The 4th tone is:', options: ['هابطة حادة', 'عالية مستوية', 'صاعدة'], correct: 'هابطة حادة' },
    { q_ar: 'البينين الصحيح لـ 谢谢:', q_en: 'Pinyin of 谢谢:', chinese: '谢谢', options: ['xièxie', 'shièshiè', 'jièjie'], correct: 'xièxie' },
    { q_ar: '吗 بالنغمة المحايدة تجعل الجملة:', q_en: '吗 (neutral) makes a sentence:', chinese: '吗', options: ['سؤالاً', 'نفياً', 'أمراً'], correct: 'سؤالاً', pinyin: 'ma' },
  ],
  stage1: [
    { q_ar: 'تحية المعلم باحترام:', q_en: 'Polite greeting for a teacher:', options: ['您好', '你好', '再见'], correct: '您好', pinyin: 'nín hǎo' },
    { q_ar: 'الرد على 谢谢:', q_en: 'Reply to 谢谢:', chinese: '谢谢', options: ['不客气', '请坐', '你好'], correct: '不客气', pinyin: 'bú kèqi' },
    { q_ar: '"أنا طالب":', q_en: '"I am a student":', options: ['我是学生', '学生是我', '我学生是'], correct: '我是学生', pinyin: 'wǒ shì xuésheng' },
    { q_ar: 'انفِ: 我是老师 ←', q_en: 'Negate 我是老师:', chinese: '我是老师', options: ['我不是老师', '我没是老师', '不我是老师'], correct: '我不是老师', pinyin: 'wǒ bú shì lǎoshī' },
    { q_ar: 'حوّل لسؤال: 你是学生 ←', q_en: 'Make a question:', chinese: '你是学生', options: ['你是学生吗？', '吗你是学生？', '你是吗学生？'], correct: '你是学生吗？', pinyin: 'nǐ shì xuésheng ma?' },
    { q_ar: '"ما اسمك؟":', q_en: '"What is your name?":', options: ['你叫什么名字？', '你几岁？', '你在哪儿？'], correct: '你叫什么名字？', pinyin: 'nǐ jiào shénme míngzi?' },
    { q_ar: 'الرقم 25:', q_en: 'Number 25:', options: ['二十五', '五十二', '二五'], correct: '二十五', pinyin: 'èrshíwǔ' },
    { q_ar: 'سؤال طفل عن عمره:', q_en: 'Asking a child their age:', options: ['你几岁？', '您多大年纪？', '多少钱？'], correct: '你几岁？', pinyin: 'nǐ jǐ suì?' },
    { q_ar: '"أستطيع التحدث بالصينية":', q_en: '"I can speak Chinese":', options: ['我会说汉语', '我说会汉语', '我汉语会说'], correct: '我会说汉语', pinyin: 'wǒ huì shuō hànyǔ' },
    { q_ar: 'اسمي = 我___名字:', q_en: 'My name = 我___名字:', chinese: '我___名字', options: ['的', '是', '很'], correct: '的', pinyin: 'wǒ de míngzi' },
  ],
};

const PASS_PCT = 70;

/** V2.2 /certificates — level certificates: locked → ready → earned, with local final tests + printable preview */
export default function Certificates() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const isAr = lang === 'ar';
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<UserProgressItem[]>([]);
  const [certs, setCerts] = useState(loadCerts());
  const [testStage, setTestStage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLessons(await fetchLessons());
        if (user) {
          try { setProgress(await fetchUserProgress(user.id)); } catch { setProgress([]); }
        }
      } catch { /* certificates still render */ }
    }
    load();
  }, [user]);

  const doneSet = completedLessonIds(progress);

  const stageStatus = (stageId: string): 'locked' | 'ready' | 'earned' | 'soon' => {
    if (certs[stageId]) return 'earned';
    if (!TESTS[stageId]) return 'soon';
    if (stageId === 'stage0') return 'ready'; // pinyin level: always testable
    const stage = STAGES.find(s => s.id === stageId)!;
    const sl = lessonsInStage(stage, lessons);
    const done = sl.filter(l => doneSet.has(l.id)).length;
    // ready when at least half the stage lessons are completed (or no DB lessons available)
    return sl.length === 0 || done >= Math.ceil(sl.length / 2) ? 'ready' : 'locked';
  };

  const onPass = (stageId: string, score: number, total: number) => {
    saveCert(stageId, { score, total, date: new Date().toISOString().slice(0, 10) });
    awardXP(`cert:${stageId}`, 50);
    setCerts(loadCerts());
    setTestStage(null);
    setPreview(stageId);
  };

  // -------- printable certificate preview --------
  if (preview && certs[preview]) {
    const stage = STAGES.find(s => s.id === preview)!;
    const rec = certs[preview];
    return (
      <div className="max-w-[820px] mx-auto px-6 py-8 print:p-0 print:max-w-none">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => setPreview(null)} className="btn-secondary text-sm py-2 px-4">{t('certs.back')}</button>
          <div className="flex items-center gap-2">
            <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder={t('certs.namePlaceholder')}
              className="bg-[#161616] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-[#FF3333]/50 outline-none" />
            <button onClick={() => window.print()} className="btn-primary text-sm py-2 px-5"><Printer size={15} /> {t('certs.print')}</button>
          </div>
        </div>
        <div className="bg-white text-black rounded-2xl p-12 print:rounded-none cert-sheet text-center border-[10px] border-[#c9a86a]">
          <style>{`@media print { body * { visibility: hidden; } .cert-sheet, .cert-sheet * { visibility: visible; } .cert-sheet { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
          <p className="text-5xl mb-2">{stage.emoji}</p>
          <h1 className="font-bold text-3xl mb-1">NiHao · 你好</h1>
          <p className="text-sm text-gray-600 mb-6">cnihao.com</p>
          <p className="text-lg mb-1">{t('certs.certifies')}</p>
          <p className="font-bold text-3xl my-3 border-b-2 border-[#c9a86a] inline-block px-8 pb-1">{studentName || '________________'}</p>
          <p className="text-lg mt-2 mb-1">{t('certs.completedLevel')}</p>
          <h2 className="font-bold text-2xl text-[#b02020] mb-4">{isAr ? stage.title_ar : stage.title_en} · {isAr ? stage.title_en : stage.title_ar}</h2>
          <div className="flex justify-center gap-12 text-sm mt-6">
            <span><strong>{t('certs.score')}:</strong> {Math.round((rec.score / rec.total) * 100)}%</span>
            <span><strong>{t('certs.date')}:</strong> {rec.date}</span>
          </div>
          <p className="text-xs text-gray-500 mt-8">{t('certs.footer')}</p>
        </div>
      </div>
    );
  }

  // -------- final test runner --------
  if (testStage && TESTS[testStage]) {
    return <FinalTest stageId={testStage} questions={TESTS[testStage]} onExit={() => setTestStage(null)} onPass={onPass} />;
  }

  // -------- certificates grid --------
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <GraduationCap className="text-[#FF3333]" /> {t('certs.title')}
        </h1>
        <p className={`text-sm mb-8 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('certs.subtitle')}
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAGES.map(stage => {
          const status = stageStatus(stage.id);
          return (
            <div key={stage.id} className={`liquid-glass p-5 rounded-2xl border ${status === 'earned' ? 'border-[#f59e0b]/40' : 'border-transparent'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{stage.emoji}</span>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-white text-sm">{isAr ? stage.title_ar : stage.title_en}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>{isAr ? stage.title_en : stage.title_ar}</p>
                </div>
              </div>
              {status === 'earned' && (
                <>
                  <p className="text-xs text-[#10b981] flex items-center gap-1.5 mb-3"><Check size={13} /> {t('certs.earned')} · {Math.round((certs[stage.id].score / certs[stage.id].total) * 100)}% · {certs[stage.id].date}</p>
                  <button onClick={() => setPreview(stage.id)} className="btn-primary text-xs py-2 px-4 w-full"><Printer size={12} /> {t('certs.print')}</button>
                </>
              )}
              {status === 'ready' && (
                <>
                  <p className="text-xs text-[#f59e0b] mb-3">{t('certs.ready')}</p>
                  <button onClick={() => setTestStage(stage.id)} className="btn-primary text-xs py-2 px-4 w-full">{t('certs.takeTest')} <ArrowRight size={12} /></button>
                </>
              )}
              {status === 'locked' && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-tertiary)' }}><Lock size={12} /> {t('certs.locked')}</p>
              )}
              {status === 'soon' && (
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-tertiary)' }}>🏆 {t('certs.testSoon')}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinalTest({ stageId, questions, onExit, onPass }: {
  stageId: string; questions: TQ[]; onExit: () => void;
  onPass: (stageId: string, score: number, total: number) => void;
}) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);
  const stage = STAGES.find(s => s.id === stageId)!;
  const q = questions[index];

  const pick = (opt: string) => {
    if (picked !== null) return;
    setPicked(opt);
    if (opt === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
      setPicked(null);
    } else {
      const finalScore = score;
      if ((finalScore / questions.length) * 100 >= PASS_PCT) onPass(stageId, finalScore, questions.length);
      else setFailed(true);
    }
  };

  if (failed) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-16">
        <div className="liquid-glass p-10 text-center">
          <X size={36} className="text-[#FF3333] mx-auto mb-3" />
          <h2 className="font-display font-bold text-2xl text-white mb-2">{t('certs.failed')}</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>{score} / {questions.length} · {t('certs.needPct')}</p>
          <button onClick={onExit} className="btn-primary text-sm">{t('certs.back')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-lg text-white">{stage.emoji} {t('certs.finalTest')}: {isAr ? stage.title_ar : stage.title_en}</h2>
        <button onClick={onExit} className="btn-secondary text-xs py-1.5 px-3">{t('certs.back')}</button>
      </div>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-[#FF3333] rounded-full transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
        <span className="text-xs shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>{index + 1}/{questions.length}</span>
      </div>
      <div className="liquid-glass p-6">
        <p className={`text-base text-white mb-3 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>{isAr ? q.q_ar : q.q_en}</p>
        {q.chinese && <p className="font-chinese text-3xl text-white text-center mb-4">{q.chinese}</p>}
        <div className="space-y-2">
          {q.options.map(opt => {
            let cls = 'w-full text-left p-3 rounded-xl border text-base transition-all font-chinese ';
            if (picked !== null) {
              if (opt === q.correct) cls += 'border-[#10b981]/50 bg-[#10b981]/15 text-[#10b981]';
              else if (opt === picked) cls += 'border-[#FF3333]/50 bg-[#FF3333]/15 text-[#FF3333]';
              else cls += 'border-white/5 bg-white/[0.02] text-[#a0a0a0]';
            } else cls += 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]';
            return <button key={opt} onClick={() => pick(opt)} disabled={picked !== null} className={cls}>{opt}</button>;
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
              {index < questions.length - 1 ? t('listening.next') : t('listening.finish')}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
