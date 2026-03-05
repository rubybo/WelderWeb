import React from 'react';
import { ViewState } from '../types';
import {
  Flame,
  BookOpen,
  Camera,
  MessageSquare,
  ShieldAlert,
  FolderOpen,
  Gamepad2,
} from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: ViewState.HOME, label: 'Главная', icon: <Flame size={20} /> },
    { view: ViewState.MODULES, label: 'Видеоурок', icon: <BookOpen size={20} /> },
    { view: ViewState.MATERIALS, label: 'УМК', icon: <FolderOpen size={20} /> },
    { view: ViewState.GAME, label: 'Игра', icon: <Gamepad2 size={20} /> },
    { view: ViewState.ANALYZER, label: 'Анализ шва', icon: <Camera size={20} /> },
    { view: ViewState.CHAT, label: 'ИИ наставник', icon: <MessageSquare size={20} /> },
    { view: ViewState.SAFETY, label: 'ТБ', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-800/95 backdrop-blur-md border-t border-slate-700 md:relative md:top-0 md:border-t-0 md:border-b md:bg-slate-800 z-50 safe-area-bottom">
      <div className="max-w-7xl mx-auto px-1 md:px-4">
        <div className="flex justify-between md:justify-start md:gap-2 h-14 md:h-16 items-center overflow-x-auto scrollbar-hide">
          <div className="hidden md:flex items-center text-orange-500 font-bold text-xl mr-4">
            <Flame className="mr-2" /> НГПК
          </div>
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 px-1 md:px-3 py-2 rounded-lg transition-colors flex-1 md:flex-none min-w-[50px] md:min-w-0
                ${currentView === item.view 
                  ? 'text-orange-500 bg-slate-700/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}
            >
              <span className="md:hidden">{item.icon}</span>
              <span className="hidden md:inline">{item.icon}</span>
              <span className="text-[10px] md:text-sm font-medium truncate max-w-[50px] md:max-w-none">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;