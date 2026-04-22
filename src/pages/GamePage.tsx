import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getLevel } from '../data/campaignLevels';
import { solveLevel } from '../engine/gameRules';
import { Board } from '../components/game/Board';
import { ArrowLeft, SkipForward, Lightbulb, RotateCcw, Settings, Info, Heart, Star, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import { audioManager } from '../utils/audio';

const GamePage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { 
    startLevel, 
    currentLevel, 
    resetPath, 
    setPath,
    decreaseAttempt, 
    attemptsLeft, 
    status,
    unlockNextLevel,
    settings,
    updateSettings
  } = useGameStore();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isHinting, setIsHinting] = useState(false);

  useEffect(() => {
    const id = parseInt(levelId || '1', 10);
    const level = getLevel(id);
    if (level) {
      startLevel(level);
    } else {
      navigate('/levels');
    }
  }, [levelId, navigate, startLevel]);

  const handleSuccess = () => {
    unlockNextLevel();
    
    // Trigger confetti burst
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#f43f5e', '#10b981', '#facc15']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#f43f5e', '#10b981', '#facc15']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setTimeout(() => {
      setShowSuccessModal(true);
    }, 800);
  };

  const handleFail = () => {
    decreaseAttempt();
    if (attemptsLeft > 1) {
      // Small delay before reset so user can see they failed
      setTimeout(() => {
        resetPath();
      }, 400);
    }
  };

  const handleNextLevel = () => {
    setShowSuccessModal(false);
    if (currentLevel) {
      navigate(`/game/${currentLevel.id + 1}`);
    }
  };

  const handleHint = () => {
    if (!currentLevel || isHinting || status !== 'playing') return;
    
    setIsHinting(true);
    
    // We solve the level to get the guaranteed path.
    // If the user has already drawn part of a path, we try to solve from their current path.
    // If their current path is a dead end (unsolvable), we reset to the start cell and show the hint from there.
    const { path } = useGameStore.getState();
    
    // Slight delay to allow UI to show loading state if needed
    setTimeout(() => {
      let solution = solveLevel(currentLevel, path);
      
      // If current path is wrong, solve from the beginning
      if (!solution) {
        solution = solveLevel(currentLevel, [currentLevel.startCell]);
      }

      if (solution) {
        // Calculate how many steps to reveal based on difficulty (e.g., 30% of total cells, min 3, max 8)
        const revealCount = Math.max(3, Math.min(8, Math.floor(currentLevel.walkableCells.length * 0.3)));
        
        // Ensure we don't reveal the entire level, leave at least 1 step for the user
        const safeRevealCount = Math.min(revealCount, solution.length - 1);
        
        // Take the first N steps of the solution
        const hintPath = solution.slice(0, safeRevealCount);
        
        // Determine the steps we need to actually animate (from current path length to hintPath length)
        const stepsToAnimate = hintPath.slice(path.length);
        
        if (stepsToAnimate.length > 0) {
          let stepIndex = 0;
          // Animate the hint path step by step
          const intervalId = setInterval(() => {
            if (stepIndex < stepsToAnimate.length) {
              const currentAnimatedPath = [...path, ...stepsToAnimate.slice(0, stepIndex + 1)];
              
              // Only play sound and update if we're actually adding a new cell
              if (currentAnimatedPath.length > path.length) {
                audioManager.playSwipeSound();
              }
              
              setPath(currentAnimatedPath);
              stepIndex++;
            } else {
              clearInterval(intervalId);
              setIsHinting(false);
            }
          }, 150); // 150ms delay between each step
        } else {
          // If we already have more path than the hint provides, just show the hint path
          setPath(hintPath);
          setIsHinting(false);
        }
      } else {
         setIsHinting(false);
      }
    }, 100);
  };

  if (!currentLevel) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-black relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 relative">
        <button 
          className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95"
          onClick={() => navigate('/levels')}
        >
          <Info size={20} />
        </button>
        <div className="px-6 py-2 bg-slate-800/80 rounded-full font-bold text-slate-200 border border-slate-700 shadow-md">
          关卡 {currentLevel.id}
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95"
            onClick={() => updateSettings({ bgmEnabled: !settings.bgmEnabled })}
          >
            {settings.bgmEnabled ? <Volume2 size={20} className="text-green-400" /> : <VolumeX size={20} className="text-slate-500" />}
          </button>
          <button 
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95"
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 relative">
        <Board level={currentLevel} onSuccess={handleSuccess} onFail={handleFail} />
        
        {/* Attempts Display */}
        <div className="mt-8 flex gap-1 items-center justify-center">
          {Array.from({ length: currentLevel.maxAttempts }).map((_, i) => (
            <Heart 
              key={i} 
              size={18} 
              className={`transition-all duration-300 ${
                i < attemptsLeft 
                  ? 'text-rose-500 fill-rose-500' 
                  : 'text-slate-700 fill-slate-800 scale-75'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6 flex justify-between items-center z-10 relative pb-10">
        <button 
          className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95"
          onClick={() => navigate('/levels')}
        >
          <ArrowLeft size={28} />
        </button>
        
        <button 
          className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center text-slate-300 active:scale-95 relative"
        >
          <SkipForward size={24} />
          <span className="text-[10px] font-bold mt-0.5">跳过</span>
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center border-2 border-black">
            <PlayIcon className="w-2 h-2 text-white" />
          </div>
        </button>
        
        <button 
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-yellow-400 relative transition-all duration-200
            ${isHinting 
              ? 'bg-slate-700 border-yellow-500/30 scale-95 opacity-70' 
              : 'bg-slate-800/80 border-slate-700 active:scale-95 shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:bg-slate-800 hover:border-yellow-500/50'
            }
          `}
          onClick={handleHint}
          disabled={isHinting}
        >
          <Lightbulb size={28} className={isHinting ? "animate-pulse fill-yellow-500/50" : "fill-yellow-500/20"} />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center border-2 border-black">
            <PlayIcon className="w-2 h-2 text-white" />
          </div>
        </button>
        
        <button 
          className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95"
          onClick={resetPath}
        >
          <RotateCcw size={28} />
        </button>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-3xl flex flex-col items-center shadow-2xl max-w-xs w-full mx-4"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <Star size={40} className="text-white fill-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">通关成功!</h2>
              <p className="text-slate-400 mb-8 font-medium">恭喜完成关卡 {currentLevel.id}</p>
              
              <div className="flex gap-4 w-full">
                <button 
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold active:scale-95 transition-transform"
                  onClick={() => {
                    setShowSuccessModal(false);
                    resetPath();
                  }}
                >
                  重玩
                </button>
                <button 
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95 transition-transform"
                  onClick={handleNextLevel}
                >
                  下一关
                </button>
              </div>
            </motion.div>
            
            {/* Confetti / Particle effect can be added here */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failed Modal */}
      <AnimatePresence>
        {status === 'failed' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-rose-900/50 p-8 rounded-3xl flex flex-col items-center shadow-2xl max-w-xs w-full mx-4"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-rose-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(244,63,94,0.5)]">
                <Heart size={40} className="text-white fill-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">机会耗尽</h2>
              <p className="text-slate-400 mb-8 font-medium text-center">你已经用完了所有的机会，再试一次吧！</p>
              
              <div className="flex gap-4 w-full">
                <button 
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold active:scale-95 transition-transform"
                  onClick={() => navigate('/levels')}
                >
                  返回
                </button>
                <button 
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.5)] active:scale-95 transition-transform"
                  onClick={() => {
                    startLevel(currentLevel);
                  }}
                >
                  重新开始
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple Play Icon for badges
const PlayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default GamePage;
