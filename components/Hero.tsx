import React from 'react';
import { ChevronRight } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop")' }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/90 via-slate-900/30 to-slate-950"></div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.25),transparent_55%)]"></div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-[-80px]">
        <div className="inline-flex flex-col items-center gap-1 px-5 py-2 rounded-2xl bg-slate-900/55 backdrop-blur border border-slate-700/70 text-slate-200 mb-6 shadow-lg shadow-black/25">
          <div className="text-[11px] md:text-xs tracking-[0.18em] uppercase text-slate-300">
            Новополоцкий государственный политехнический колледж
          </div>
          <div className="text-xs md:text-sm font-semibold text-orange-200/95">
            Электронный образовательный ресурс
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          ИCКУСCТВО <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">СВАРКИ</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          От теории ручной дуговой сварки до анализа швов с помощью ИИ. Изучай, практикуйся и совершенствуй мастерство с интерактивным помощником
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onStart}
            className="group px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center text-lg"
          >
            Начать обучение
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <a href="#about" className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline">
            Узнать больше
          </a>
        </div>

        {/* Features Grid Mini */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="bg-slate-900/45 backdrop-blur p-6 rounded-xl border border-slate-700/70 shadow-lg shadow-black/30">
            <h3 className="text-orange-400 font-bold mb-2">📚 База Знаний</h3>
            <p className="text-slate-300/90 text-sm">Подробные гайды по MMA, MIG/MAG и TIG сварке с иллюстрациями.</p>
          </div>
          <div className="bg-slate-900/45 backdrop-blur p-6 rounded-xl border border-slate-700/70 shadow-lg shadow-black/30">
            <h3 className="text-orange-400 font-bold mb-2">🤖 ИИ Наставник</h3>
            <p className="text-slate-300/90 text-sm">Чат-бот, который ответит на любой технический вопрос 24/7.</p>
          </div>
          <div className="bg-slate-900/45 backdrop-blur p-6 rounded-xl border border-slate-700/70 shadow-lg shadow-black/30">
            <h3 className="text-orange-400 font-bold mb-2">📸 Анализ Швов</h3>
            <p className="text-slate-300/90 text-sm">Загрузи фото — получи разбор ошибок и советы по улучшению.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;