import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Modules from './components/Modules';
import WeldAnalyzer from './components/WeldAnalyzer';
import ChatAssistant from './components/ChatAssistant';
import Safety from './components/Safety';
import Materials from './components/Materials';
import Game from './components/Game';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <Hero onStart={() => setCurrentView(ViewState.MODULES)} />;
      case ViewState.MODULES:
        return <Modules />;
      case ViewState.MATERIALS:
        return <Materials />;
      case ViewState.ANALYZER:
        return <WeldAnalyzer />;
      case ViewState.CHAT:
        return <ChatAssistant />;
      case ViewState.SAFETY:
        return <Safety />;
      case ViewState.GAME:
        return <Game />;
      default:
        return <Hero onStart={() => setCurrentView(ViewState.MODULES)} />;
    }
  };

  return (
    <div
      className={`min-h-screen text-slate-100 font-sans selection:bg-orange-500 selection:text-white ${
        currentView === ViewState.HOME ? 'bg-slate-900' : 'relative'
      }`}
      style={
        currentView === ViewState.HOME
          ? undefined
          : {
              backgroundColor: '#020617',
              // Слой 1: более лёгкий градиент, чтобы фон сварки был заметнее,
              // слой 2: фотография сварки
              backgroundImage:
                'radial-gradient(circle at top, rgba(15,23,42,0.55) 0%, rgba(2,6,23,0.85) 55%, rgba(2,6,23,0.95) 100%), ' +
                'url("https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2000&auto=format&fit=crop")',
              backgroundRepeat: 'no-repeat, no-repeat',
              backgroundPosition: 'center center, center center',
              backgroundSize: 'cover, cover',
              backgroundAttachment: 'fixed',
            }
      }
    >
      {/* Conditionally render header only if not home, or always render it? 
          For aesthetics, Hero takes full screen on Home. Navigation is sticky or fixed. */}
      {currentView !== ViewState.HOME && (
         <Navigation currentView={currentView} onNavigate={setCurrentView} />
      )}

      <main
        className={`
          ${currentView === ViewState.HOME ? '' : 'pt-6 pb-24 md:pb-10'}
          ${currentView === ViewState.HOME ? '' : 'min-h-screen'}
          animate-fade-in
        `}
      >
        {renderContent()}
      </main>

      {/* Mobile nav spacing is handled by padding-bottom on main */}
      {currentView === ViewState.HOME && (
         <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 animate-bounce">
            <button 
              onClick={() => setCurrentView(ViewState.MODULES)}
              className="bg-slate-800/80 backdrop-blur-md text-slate-400 hover:text-white px-6 py-2 rounded-full text-sm border border-slate-700 transition-colors"
            >
               Перейти к меню
            </button>
         </div>
      )}
    </div>
  );
};

export default App;