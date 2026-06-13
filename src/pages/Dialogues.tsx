import { useState, useMemo } from 'react';
import { trackActivity, awardDailyXP, XP_REWARDS } from '@/lib/gamification';
import PinyinText from '@/components/PinyinText';
import { motion } from 'framer-motion';
import { MessagesSquare, Volume2, Check, X, RotateCcw, PartyPopper } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useAudio } from '@/hooks/useAudio';
import { shuffle } from '@/lib/learning';
import { dialogues, type Dialogue } from '@/data/hanziExtra';

/**
 * V2.0.5 /dialogues — interactive A/B conversations (restaurant, taxi, shop).
 * The app speaks A's lines (TTS); the learner plays B and picks the natural
 * reply. Wrong picks explain themselves; the chat history builds up visually.
 */
export default function Dialogues() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [active, setActive] = useState<Dialogue | null>(null);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl text-white mb-2 flex items-center gap-3">
          <MessagesSquare className="text-[#FF3333]" /> {t('dialogues.title')}
        </h1>
        <p className={`text-sm mb-8 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
          {t('dialogues.subtitle')}
        </p>
      </motion.div>

      {!active ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {dialogues.map(d => (
            <button key={d.id} onClick={() => setActive(d)} className="liquid-glass p-6 text-center hover:border-[#FF3333]/30 border border-transparent transition-colors">
              <div className="text-4xl mb-3">{d.icon}</div>
              <h3 className="font-display font-bold text-white mb-1">{isAr ? d.title_ar : d.title_en}</h3>
              <p className={`text-xs ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-secondary)' }}>
                {isAr ? d.scene_ar : d.scene_en}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <DialoguePlayer key={active.id} dialogue={active} onExit={() => setActive(null)} />
      )}
    </div>
  );
}

function DialoguePlayer({ dialogue, onExit }: { dialogue: Dialogue; onExit: () => void }) {
  const { t, lang } = useI18n();
  const { play } = useAudio();
  const isAr = lang === 'ar';
  const [turnIndex, setTurnIndex] = useState(0);
  const [history, setHistory] = useState<{ speaker: 'A' | 'B'; chinese: string; pinyin: string; meaning: string }[]>([]);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const turn = dialogue.turns[turnIndex];
  const finished = turnIndex >= dialogue.turns.length;

  const choiceSet = useMemo(
    () => (turn?.choices ? shuffle(turn.choices) : []),
    [turn],
  );

  // advance through consecutive A lines automatically into history
  const showALine = () => {
    if (!turn || turn.speaker !== 'A') return;
    play(turn.chinese);
    setHistory(h => [...h, { speaker: 'A', chinese: turn.chinese, pinyin: turn.pinyin, meaning: isAr ? turn.arabic : turn.english }]);
    setTurnIndex(i => i + 1);
  };

  const pickChoice = (c: { chinese: string; pinyin: string; english: string; arabic: string; correct: boolean }) => {
    if (!c.correct) {
      setWrongPick(c.chinese);
      setMistakes(m => m + 1);
      setTimeout(() => setWrongPick(null), 800);
      return;
    }
    play(c.chinese);
    setHistory(h => [...h, { speaker: 'B', chinese: c.chinese, pinyin: c.pinyin, meaning: isAr ? c.arabic : c.english }]);
    setWrongPick(null);
    const nextIndex = turnIndex + 1;
    if (nextIndex >= dialogue.turns.length) {
      trackActivity('dialogue_rounds');
      awardDailyXP(`dialogue_${dialogue.id}`, XP_REWARDS.dialogue_round);
    }
    setTurnIndex(i => i + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-white">{dialogue.icon} {isAr ? dialogue.title_ar : dialogue.title_en}</h2>
        <button onClick={onExit} className="btn-secondary text-xs py-1.5 px-3">{t('dialogues.back')}</button>
      </div>
      <p className={`text-xs mb-5 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>
        {isAr ? dialogue.scene_ar : dialogue.scene_en}
      </p>

      {/* Chat history */}
      <div className="space-y-3 mb-6">
        {history.map((h, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${h.speaker === 'B' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 ${h.speaker === 'B' ? 'bg-[#FF3333]/15 border border-[#FF3333]/25' : 'bg-white/[0.04] border border-white/10'}`}>
              <div className="flex items-center gap-2">
                <p className="font-chinese text-lg text-white">{h.chinese}</p>
                <button onClick={() => play(h.chinese)} className="text-[#888] hover:text-white transition-colors"><Volume2 size={13} /></button>
              </div>
              <PinyinText>{h.pinyin}</PinyinText>
              <p className={`text-xs ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-secondary)' }}>{h.meaning}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current step */}
      {!finished && turn.speaker === 'A' && (
        <div className="text-center">
          <button onClick={showALine} className="btn-primary text-sm py-3 px-6">
            <Volume2 size={15} /> {history.length === 0 ? t('dialogues.start') : t('dialogues.listenNext')}
          </button>
        </div>
      )}

      {!finished && turn.speaker === 'B' && turn.choices && (
        <div>
          <p className={`text-xs mb-3 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text-tertiary)' }}>
            {t('dialogues.yourTurn')}
          </p>
          <div className="space-y-2">
            {choiceSet.map(c => (
              <button key={c.chinese} onClick={() => pickChoice(c)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${wrongPick === c.chinese ? 'border-[#FF3333]/60 bg-[#FF3333]/20' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#FF3333]/30'}`}>
                <p className="font-chinese text-base text-white">{c.chinese}</p>
                <PinyinText>{c.pinyin}</PinyinText>
                <p className={`text-[11px] ${isAr ? 'font-arabic' : ''}`} style={{ color: 'var(--color-text-secondary)' }}>{isAr ? c.arabic : c.english}</p>
              </button>
            ))}
          </div>
          {wrongPick && (
            <p className="flex items-center gap-2 text-xs text-[#FF3333] mt-2"><X size={13} /> {t('dialogues.tryBetter')}</p>
          )}
        </div>
      )}

      {finished && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="liquid-glass p-8 text-center">
          <PartyPopper size={36} className="text-[#f59e0b] mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-white mb-2">{t('dialogues.done')}</h3>
          <p className="text-sm mb-5 flex items-center justify-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            {mistakes === 0
              ? <><Check size={15} className="text-[#10b981]" /> {t('dialogues.perfect')}</>
              : <>{t('dialogues.mistakes')}: {mistakes}</>}
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { setTurnIndex(0); setHistory([]); setMistakes(0); }} className="btn-secondary text-sm"><RotateCcw size={14} /> {t('grammar.tryAgainBtn')}</button>
            <button onClick={onExit} className="btn-primary text-sm">{t('dialogues.more')}</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
