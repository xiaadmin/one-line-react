import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Music, Volume2, Vibrate, Trash2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, resetProgress } = useGameStore();

  const handleResetProgress = () => {
    if (window.confirm('确定要清除所有进度吗？此操作无法恢复。')) {
      resetProgress();
      alert('进度已清除');
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center p-4 bg-slate-900 border-b border-slate-800">
        <button 
          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95 transition-transform"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-slate-100 mr-10">设置</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-300">
              <Music size={24} />
              <span className="font-medium text-lg">背景音乐</span>
            </div>
            <button 
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.bgmEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
              onClick={() => updateSettings({ bgmEnabled: !settings.bgmEnabled })}
            >
              <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${settings.bgmEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          
          <div className="h-px bg-slate-800 w-full" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-300">
              <Volume2 size={24} />
              <span className="font-medium text-lg">游戏音效</span>
            </div>
            <button 
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.sfxEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
              onClick={() => updateSettings({ sfxEnabled: !settings.sfxEnabled })}
            >
              <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${settings.sfxEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          
          <div className="h-px bg-slate-800 w-full" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-300">
              <Vibrate size={24} />
              <span className="font-medium text-lg">震动反馈</span>
            </div>
            <button 
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.vibrationEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
              onClick={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
            >
              <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${settings.vibrationEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <button 
          className="mt-8 bg-rose-950/30 border border-rose-900/50 rounded-3xl p-4 flex items-center justify-center gap-2 text-rose-500 font-bold active:scale-95 transition-transform"
          onClick={handleResetProgress}
        >
          <Trash2 size={20} />
          清除游戏进度
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
