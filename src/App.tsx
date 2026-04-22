import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LevelSelectPage from './pages/LevelSelectPage';
import GamePage from './pages/GamePage';
import DailyChallengePage from './pages/DailyChallengePage';
import SettingsPage from './pages/SettingsPage';
import { useGameStore } from './store/gameStore';
import { audioManager } from './utils/audio';

const App: React.FC = () => {
  const { settings } = useGameStore();

  useEffect(() => {
    audioManager.setBgmEnabled(settings.bgmEnabled);
  }, [settings.bgmEnabled]);

  useEffect(() => {
    audioManager.setSfxEnabled(settings.sfxEnabled);
  }, [settings.sfxEnabled]);

  // Try playing BGM on first click
  useEffect(() => {
    const handleFirstClick = () => {
      audioManager.init();
      if (settings.bgmEnabled) {
        audioManager.playBGM();
      }
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, [settings.bgmEnabled]);

  return (
    <BrowserRouter basename="/one-line-react">
      <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden select-none">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/levels" element={<LevelSelectPage />} />
          <Route path="/game/:levelId" element={<GamePage />} />
          <Route path="/daily" element={<DailyChallengePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
