import React, { useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import type { Flashcard as FlashcardType } from '@/types/flashcard';

interface FlashcardProps {
  card: FlashcardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(card.chinese);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [card.chinese]);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[3/4] perspective-1000">
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={!isFlipped ? onFlip : undefined}
      >
        {/* Front */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-lg flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 ${
          isFlipped ? 'opacity-0' : 'opacity-100'
        }`}>
          <span className="text-6xl font-bold text-gray-800 mb-4 select-none">
            {card.chinese}
          </span>
          <span className="text-sm text-gray-400">اضغط للقلب</span>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl shadow-lg flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 ${
          isFlipped ? 'opacity-100' : 'opacity-0'
        }`}>
          <span className="text-5xl font-bold text-gray-800 mb-2">{card.chinese}</span>
          <span className="text-2xl text-green-600 font-medium mb-1">{card.pinyin}</span>
          <span className="text-xl text-gray-700 font-medium mb-4">{card.arabic}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              speak();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-700"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">استمع</span>
          </button>
        </div>
      </div>
    </div>
  );
};
