import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFlashcardGame } from '@/hooks/useFlashcardGame';
import { GameHUD } from '@/components/games/flashcard/GameHUD';
import { Flashcard } from '@/components/games/flashcard/Flashcard';
import { ProgressBar } from '@/components/games/flashcard/ProgressBar';
import { ResultScreen } from '@/components/games/flashcard/ResultScreen';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import Seo from '@/components/Seo';

export const FlashcardPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || null;

  const {
    currentCard,
    isFlipped,
    cardsPlayed,
    correctAnswers,
    wrongAnswers,
    combo,
    maxCombo,
    xpEarned,
    coinsEarned,
    lives,
    isComplete,
    isLoading,
    queue,
    accuracy,
    loadGame,
    handleKnow,
    handleDontKnow,
    handleCorrect,
    handleWrong,
  } = useFlashcardGame(userId);

  useEffect(() => {
    trackEvent('flashcard_game_view', {});
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    if (isComplete) {
      trackEvent('flashcard_game_complete', { xp: xpEarned, accuracy, maxCombo });
    }
  }, [isComplete, xpEarned, accuracy, maxCombo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البطاقات...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <ResultScreen
        xpEarned={xpEarned}
        coinsEarned={coinsEarned}
        correctAnswers={correctAnswers}
        wrongAnswers={wrongAnswers}
        accuracy={accuracy}
        maxCombo={maxCombo}
        onRestart={loadGame}
      />
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">لا توجد بطاقات متاحة</p>
      </div>
    );
  }

  const isOutOfLives = lives === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <Seo />
      <GameHUD 
        lives={lives} 
        streak={0}
        coins={coinsEarned} 
        xp={xpEarned} 
        combo={combo} 
      />

      <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        <ProgressBar 
          current={cardsPlayed} 
          total={queue.length} 
          className="mb-6" 
        />

        <div className="flex-1 flex items-center justify-center mb-6">
          <Flashcard 
            card={currentCard} 
            isFlipped={isFlipped} 
            onFlip={handleKnow} 
          />
        </div>

        {!isFlipped ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={handleKnow}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm active:scale-95"
            >
              <CheckCircle className="w-5 h-5" />
              أعرفها
            </button>

            <button
              onClick={handleDontKnow}
              disabled={isOutOfLives}
              className={`flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-xl transition-colors shadow-sm active:scale-95 ${
                isOutOfLives 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              ما أعرفها
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={handleCorrect}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm active:scale-95"
            >
              <CheckCircle className="w-5 h-5" />
              صح
            </button>

            <button
              onClick={handleWrong}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm active:scale-95"
            >
              <XCircle className="w-5 h-5" />
              خطأ
            </button>
          </div>
        )}

        {isOutOfLives && (
          <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ انتهت القلوب! يمكنك الاستمرار بالتدريب بدون XP أو الانتظار 30 دقيقة
            </p>
            <button
              onClick={() => handleWrong()}
              className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900"
            >
              أكمل تدريب بدون نقاط
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
