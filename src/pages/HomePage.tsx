import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Settings, Info, Trophy, Gift, Award, Play, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { progress, settings, updateSettings } = useGameStore();

  return (
    <div className="flex flex-col items-center justify-between h-screen w-full relative bg-gradient-to-b from-indigo-950 via-slate-900 to-black overflow-hidden pb-10">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-[50px] opacity-50 animate-pulse"></div>
        <div className="absolute top-[30%] right-[10%] w-40 h-40 bg-purple-500 rounded-full mix-blend-screen filter blur-[60px] opacity-50"></div>
      </div>

      {/* Header buttons */}
      <div className="w-full flex justify-between p-4 z-10 relative">
        <button 
          className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95 transition-transform"
          onClick={() => alert('About: One Line Game v1.0')}
        >
          <Info size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95 transition-transform"
            onClick={() => updateSettings({ bgmEnabled: !settings.bgmEnabled })}
          >
            {settings.bgmEnabled ? <Volume2 size={20} className="text-green-400" /> : <VolumeX size={20} className="text-slate-500" />}
          </button>
          <button 
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95 transition-transform"
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Left Sidebar Menu */}
      <div className="absolute left-2 top-1/4 flex flex-col gap-4 z-10">
        <button className="flex flex-col items-center p-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-1 shadow-lg shadow-orange-500/20">
            <Gift className="text-white drop-shadow-md" />
          </div>
          <span className="text-[10px] font-bold text-amber-200">限定福利</span>
        </button>
        <button className="flex flex-col items-center p-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center mb-1 shadow-lg shadow-yellow-500/20">
            <Trophy className="text-yellow-900 drop-shadow-md" />
          </div>
          <span className="text-[10px] font-bold text-yellow-200">关卡榜</span>
        </button>
      </div>

      {/* Main Logo Area */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 relative w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative w-64 h-64 flex items-center justify-center"
        >
          {/* Logo illustration placeholder */}
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
              <path d="M 20 50 Q 50 10 80 50 T 20 50" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
              <path d="M 20 50 Q 50 90 80 50" fill="none" stroke="#f43f5e" strokeWidth="8" strokeLinecap="round" />
              <path d="M 50 20 Q 90 50 50 80 T 50 20" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
              <circle cx="20" cy="50" r="5" fill="#facc15" />
              <circle cx="80" cy="50" r="5" fill="#60a5fa" />
            </svg>
          </div>
          <h1 className="text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10 text-center">
            ONE<br/>LINE
          </h1>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-xs flex flex-col gap-3 px-6 z-10">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-300 font-medium mb-1">免费次数 {progress.dailyChallenge.attemptsLeft}/3</span>
          <button 
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(217,70,239,0.4)] active:scale-95 transition-transform"
            onClick={() => navigate('/daily')}
          >
            每日挑战
          </button>
        </div>

        <div className="flex flex-col items-center mt-2">
          <div className="px-4 py-1 bg-slate-800/80 rounded-t-lg text-xs font-bold text-slate-300 border border-b-0 border-slate-700">
            关卡 {progress.unlockedLevel}
          </div>
          <button 
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-bold text-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95 transition-transform flex justify-center items-center gap-2"
            onClick={() => navigate('/levels')}
          >
            开始 <Play fill="currentColor" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
