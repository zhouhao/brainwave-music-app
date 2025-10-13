import React from 'react';
import { AudioProvider } from '@/contexts/AudioContext';
import BrainwaveApp from '@/components/BrainwaveApp';

function AppHeader() {
  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">脑</span>
            </div>
            <h1 className="text-xl font-bold text-white">脑波音乐</h1>
          </div>
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppHeader />
      
      {/* Main Content */}
      <main>
        <BrainwaveApp />
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 脑波音乐. 由 MiniMax Agent 开发。</p>
            <p className="mt-2 text-sm">
              基于科学的脑波调节技术，为您提供个性化的音频体验。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;