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
    { view: ViewState.MODULES, label: 'Теория', icon: <BookOpen size={20} /> },
    { view: ViewState.MATERIALS, label: 'УМК', icon: <FolderOpen size={20} /> },
    { view: ViewState.GAME, label: 'Игра', icon: <Gamepad2 size={20} /> },
    { view: ViewState.ANALYZER, label: 'Анализ шва', icon: <Camera size={20} /> },
    { view: ViewState.CHAT, label: 'ИИ Наставник', icon: <MessageSquare size={20} /> },
    { view: ViewState.SAFETY, label: 'ТБ', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-800 border-t border-slate-700 md:relative md:top-0 md:border-t-0 md:border-b z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between md:justify-start md:gap-8 h-16 items-center">
          <div className="hidden md:flex items-center text-orange-500 font-bold text-xl mr-8">
            <Flame className="mr-2" /> НГПК
          </div>
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-colors
                ${currentView === item.view 
                  ? 'text-orange-500 bg-slate-700/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}
            >
              {item.icon}
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;