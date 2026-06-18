import React from 'react';
import { Trophy, RotateCcw, Home, Target, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResultScreenProps {
  xpEarned: number;
  coinsEarned: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  maxCombo: number;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  xpEarned,
  coinsEarned,
  correctAnswers,
  wrongAnswers,
  accuracy,
  maxCombo,
  onRestart,
}) => {
  const getMessage = () => {
    if (accuracy >= 90) return 'ممتاز! 🌟';
    if (accuracy >= 70) return 'أحسنت! 👏';
    if (accuracy >= 50) return 'جيد، استمر! 💪';
    return 'لا تستسلم! 🎯';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-yellow-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">{getMessage()}</h2>
        <p className="text-gray-500 mb-6">أكملت الجلسة بنجاح</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-50 rounded-2xl p-4">
            <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{xpEarned}</div>
            <div className="text-xs text-purple-600">XP</div>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-4">
            <TrendingUp className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-700">{coinsEarned}</div>
            <div className="text-xs text-yellow-600">Coins</div>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{accuracy}%</div>
            <div className="text-xs text-green-600">الدقة</div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4">
            <Zap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700">x{maxCombo}</div>
            <div className="text-xs text-orange-600">أعلى Combo</div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-6">
          صح: {correctAnswers} | خطأ: {wrongAnswers}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            العب مرة ثانية
          </button>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            رجوع
          </Link>
        </div>
      </div>
    </div>
  );
};
