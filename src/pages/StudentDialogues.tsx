import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessagesSquare, ArrowLeft, ArrowRight, Volume2, BookA, AlertTriangle, Hash, Mic } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import PinyinText from '@/components/PinyinText';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd } from '@/lib/structuredData';
import { studentDialogues, studentDialogueById } from '@/data/studentDialogues';
import { wordBySlug } from '@/data/dictionaryCore';
import MarkComplete from '@/components/MarkComplete';
import VoicePractice from '@/components/VoicePractice';

/** V2.8B /dialogues/:slug — single student dialogue with audio + dictionary links */
export function StudentDialogueView() {
  const { slug } = useParams<{ slug: string }>();
  const { play } = useAudio();
  const dialogue = slug ? studentDialogueById(slug) : undefined;

  useEffect(() => {
    if (dialogue) {
      document.title = `${dialogue.title_ar} — حوار صيني | NiHao`;
      const desc = `حوار صيني واقعي: ${dialogue.title_ar} (${dialogue.title_zh}). مستوى ${dialogue.level} مع النطق والترجمة العربية والمفردات على NiHao.`;
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'description'); document.head.appendChild(m); }
      m.setAttribute('content', desc);
    }
    return () => { document.title = 'NiHao'; };
  }, [dialogue]);

  if (!dialogue) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-white mb-4 font-arabic">الحوار غير موجود.</p>
        <Link to="/dialogues" className="btn-primary text-sm font-arabic">كل الحوارات</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto px-6 py-8" dir="rtl">
      <JsonLd id="dlg-breadcrumb" data={breadcrumbLd([
        { name: 'الرئيسية', path: '/' },
        { name: 'الحوارات', path: '/dialogues' },
        { name: dialogue.title_ar, path: `/dialogues/${dialogue.id}` },
      ])} />

      <Link to="/dialogues" className="btn-secondary text-xs py-2 px-4 inline-flex mb-6 font-arabic"><ArrowLeft size={13} /> كل الحوارات</Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-4xl">{dialogue.icon}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FF3333]/15 text-[#FF3333] font-display font-bold flex items-center gap-1"><Hash size={11} /> {dialogue.level}</span>
        </div>
        <h1 className="font-display font-black text-3xl text-white mb-1 font-arabic leading-snug">{dialogue.title_ar}</h1>
        <p className="font-chinese text-lg mb-3" style={{ color: 'var(--color-text-secondary)' }}>{dialogue.title_zh}</p>
        <p className="text-sm font-arabic leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>{dialogue.scene_ar}</p>

        {dialogue.disclaimer && (
          <div className="rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4 flex items-start gap-3 mb-6">
            <AlertTriangle size={18} className="text-[#f59e0b] shrink-0 mt-0.5" />
            <p className="text-xs font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{dialogue.disclaimer}</p>
          </div>
        )}

        {/* Conversation */}
        <div className="space-y-3 mb-8">
          {dialogue.turns.map((turn, i) => (
            <div key={i} className={`flex ${turn.speaker === 'B' ? 'justify-start' : 'justify-end'}`}>
              <button onClick={() => play(turn.chinese)} className={`max-w-[85%] rounded-2xl p-4 text-right transition-colors ${turn.speaker === 'B' ? 'bg-[#FF3333]/10 border border-[#FF3333]/20' : 'liquid-glass'} hover:bg-white/[0.06]`}>
                <span className="text-[10px] font-arabic block mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{turn.speakerLabel_ar}</span>
                <span className="flex items-start gap-2">
                  <Volume2 size={14} className="text-[#888] shrink-0 mt-1.5" />
                  <span className="flex-1 min-w-0">
                    <span className="font-chinese text-xl text-white block">{turn.chinese}</span>
                    <PinyinText>{turn.pinyin}</PinyinText>
                    <span className="text-sm font-arabic text-white block mt-1">{turn.arabic}</span>
                    <span className="text-xs block" style={{ color: 'var(--color-text-tertiary)' }}>{turn.english}</span>
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* V2.8C: unified voice practice (local-only recording) */}
        <section className="mb-8">
          <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><Mic size={18} className="text-[#FF3333]" /> تدرّب على النطق</h2>
          <p className="text-xs font-arabic mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
            سجّل صوتك وأنت تقرأ الحوار، ثم استمع إلى تسجيلك وقارن نطقك. التسجيل محلي فقط ولا يُحفظ.
          </p>
          <VoicePractice />
        </section>

        {/* Vocabulary with dictionary links */}
        {dialogue.vocab.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display font-bold text-lg text-white mb-3 font-arabic flex items-center gap-2"><BookA size={18} className="text-[#FF3333]" /> مفردات الحوار</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dialogue.vocab.map((v, i) => {
                const inDict = wordBySlug(v.slug);
                const inner = (
                  <span className="flex items-center gap-3 w-full">
                    <span className="font-chinese text-xl text-white shrink-0">{v.chinese}</span>
                    <span className="flex-1 min-w-0 text-right">
                      <PinyinText>{v.pinyin}</PinyinText>
                      <span className="text-sm font-arabic text-white block">{v.arabic}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>{v.hsk}</span>
                  </span>
                );
                return inDict ? (
                  <Link key={i} to={`/dictionary/${v.slug}`} className="liquid-glass rounded-xl p-3 hover:border-[#FF3333]/30 border border-transparent transition-colors">{inner}</Link>
                ) : (
                  <button key={i} onClick={() => play(v.chinese)} className="liquid-glass rounded-xl p-3 text-right">{inner}</button>
                );
              })}
            </div>
          </section>
        )}

        {/* V2.9B: mark dialogue complete */}
        <div className="my-8 flex justify-center">
          <MarkComplete type="dialogue" slug={dialogue.id} />
        </div>

        <Link to="/dictionary" className="btn-primary text-sm py-3 px-6 inline-flex font-arabic">تصفّح القاموس <ArrowRight size={15} /></Link>
      </motion.div>
    </div>
  );
}

/** V2.8B /dialogues — combined hub of student dialogues */
export default function StudentDialogues() {
  const [level, setLevel] = useState<'all' | 'HSK1' | 'HSK2'>('all');

  useEffect(() => {
    document.title = 'حوارات صينية للطلاب العرب في الصين | NiHao';
    return () => { document.title = 'NiHao'; };
  }, []);

  const list = studentDialogues.filter(d => {
    if (level === 'all') return true;
    return d.level.includes(level === 'HSK1' ? '1' : '2');
  });

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8" dir="rtl">
      <JsonLd id="dialogues-breadcrumb" data={breadcrumbLd([
        { name: 'الرئيسية', path: '/' },
        { name: 'الحوارات', path: '/dialogues' },
      ])} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3 font-arabic">
          <MessagesSquare className="text-[#FF3333]" /> حوارات الطلاب
        </h1>
        <p className="text-sm mb-6 font-arabic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          حوارات صينية واقعية لمواقف الطالب في الصين — من المطار إلى الجامعة والسكن والمستشفى. كل حوار بالنطق والترجمة العربية ومفردات مرتبطة بالقاموس.
        </p>
      </motion.div>

      <div className="flex gap-1 liquid-glass rounded-xl p-1 mb-6 w-fit">
        {(['all', 'HSK1', 'HSK2'] as const).map(l => (
          <button key={l} onClick={() => setLevel(l)} className={`px-4 py-2 rounded-lg text-xs font-display font-semibold transition-colors ${level === l ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] hover:text-white'}`}>
            {l === 'all' ? 'الكل' : l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(d => (
          <Link key={d.id} to={`/dialogues/${d.id}`} className="liquid-glass p-5 rounded-2xl hover:border-[#FF3333]/30 border border-transparent transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{d.icon}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF3333]/15 text-[#FF3333] font-display font-bold">{d.level}</span>
            </div>
            <h3 className="text-sm font-bold text-white font-arabic leading-snug mb-1">{d.title_ar}</h3>
            <p className="font-chinese text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{d.title_zh}</p>
            <p className="text-[11px] font-arabic mt-2" style={{ color: 'var(--color-text-tertiary)' }}>{d.turns.length} جملة · {d.vocab.length} كلمة</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
