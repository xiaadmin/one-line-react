import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

const DailyChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { lastCompletedDailyDate } = useGameStore();
  
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = lastCompletedDailyDate === today;

  const handleStart = () => {
    if (!isCompleted) {
      navigate('/game/9999'); // 9999 is daily level ID
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
            <p className="text-slate-400 text-sm mb-1">每日挑战</p>
            <div className="flex justify-center gap-2">
              <span className="text-slate-300 text-xs">每天通关获得一次默认关卡跳过机会</span>
            </div>
          </div>
        </div>

        {isCompleted ? (
          <div className="w-full max-w-xs py-4 rounded-2xl bg-green-500/20 text-green-400 font-bold text-xl text-center border border-green-500/50 flex flex-col gap-2">
            <div>今日挑战已完成</div>
            <div className="text-sm font-normal">已获得跳过机会</div>
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
