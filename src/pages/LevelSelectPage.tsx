import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Star } from 'lucide-react';
import { campaignLevels } from '../data/campaignLevels';

const LevelSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { progress } = useGameStore();

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center p-4 bg-slate-900 border-b border-slate-800">
        <button 
          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95 transition-transform"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-slate-100 mr-10">关卡选择</h1>
      </div>

      {/* Level Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-12">
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {campaignLevels.map((level) => {
            const isUnlocked = level.id <= progress.unlockedLevel;
            const isCompleted = progress.completedLevels.includes(level.id);

            return (
              <button
                key={level.id}
                disabled={!isUnlocked}
                onClick={() => navigate(`/game/${level.id}`)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative
                  transition-all active:scale-95
                  ${isUnlocked 
                    ? 'bg-slate-800 border border-slate-700 text-white shadow-lg shadow-black/50' 
                    : 'bg-slate-900 border border-slate-800 text-slate-600 opacity-50'
                  }
                  ${isCompleted ? 'border-blue-500/50 bg-blue-900/20' : ''}
                `}
              >
                <span className="text-xl font-bold mb-1">{level.id}</span>
                {isCompleted && (
                  <div className="flex gap-0.5 text-yellow-400 absolute bottom-2">
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelSelectPage;
