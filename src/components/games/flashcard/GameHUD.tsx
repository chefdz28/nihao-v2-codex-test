import React from 'react';
import { Heart, Flame, Coins, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameHUDProps {
  lives: number;
  streak: number;
  coins: number;
  xp: number;
  combo: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ lives, coins, xp, combo }) => {
  return (
    <div className="w-full bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          <span className="text-sm font-medium">رجوع</span>
        </Link>

        <h1 className="text-lg font-bold text-gray-800">Flashcard Blitz</h1>

        <div className="flex items-center gap-3">
          {combo > 1 && (
            <span className="flex items-center gap-1 text-orange-500 font-bold text-sm animate-pulse">
              <Flame className="w-4 h-4" />
              x{combo}
            </span>
          )}

          <span className="flex items-center gap-1 text-red-500 font-medium text-sm">
            <Heart className="w-4 h-4 fill-current" />
            {lives}
          </span>

          <span className="flex items-center gap-1 text-yellow-600 font-medium text-sm">
            <Coins className="w-4 h-4" />
            {coins}
          </span>

          <span className="flex items-center gap-1 text-purple-600 font-medium text-sm">
            <Star className="w-4 h-4 fill-current" />
            {xp}
          </span>
        </div>
      </div>
    </div>
  );
};
