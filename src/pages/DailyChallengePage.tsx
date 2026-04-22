import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { LevelData } from '../types/game';

// Mock daily level
const dailyLevel: LevelData = {
  id: 999,
  mode: 'daily',
  width: 6,
  height: 6,
  startCell: { x: 0, y: 0 },
  walkableCells: [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 },                 { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },                 { x: 5, y: 2 },
    { x: 0, y: 3 },                 { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },                 { x: 4, y: 4 }, { x: 5, y: 4 },
    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }
  ],
  difficulty: 10,
  maxAttempts: 3,
  timeLimit: 60,
};

const DailyChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { progress } = useGameStore();
  const daily = progress.dailyChallenge;

  const handleStart = () => {
    if (daily.attemptsLeft > 0 && !daily.completed) {
      navigate('/game/999'); // 999 is daily level ID
    }
  };

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
        <h1 className="flex-1 text-center text-xl font-bold text-slate-100 mr-10">每日挑战</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-8">
        
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar size={100} />
          </div>
          
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600 z-10">
            高难迷宫
          </h2>
          
          <div className="flex items-center gap-2 text-slate-300 z-10 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
            <Clock size={16} className="text-fuchsia-400" />
            <span className="font-bold text-sm">限时 60 秒</span>
          </div>
          
          <div className="text-center mt-4 z-10">
            <p className="text-slate-400 text-sm mb-1">今日剩余机会</p>
            <div className="flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full ${i < daily.attemptsLeft ? 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-slate-800'}`} 
                />
              ))}
            </div>
          </div>
        </div>

        {daily.completed ? (
          <div className="w-full max-w-xs py-4 rounded-2xl bg-green-500/20 text-green-400 font-bold text-xl text-center border border-green-500/50">
            今日挑战已完成
          </div>
        ) : daily.attemptsLeft <= 0 ? (
          <div className="w-full max-w-xs py-4 rounded-2xl bg-slate-800 text-slate-500 font-bold text-xl text-center">
            今日机会已用尽
          </div>
        ) : (
          <button 
            className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-b from-fuchsia-400 to-purple-600 text-white font-bold text-xl shadow-[0_0_20px_rgba(192,38,211,0.4)] active:scale-95 transition-transform"
            onClick={handleStart}
          >
            开始挑战
          </button>
        )}

      </div>
    </div>
  );
};

export default DailyChallengePage;
