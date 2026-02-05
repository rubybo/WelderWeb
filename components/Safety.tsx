import React from 'react';
import { SAFETY_RULES } from '../constants';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const Safety: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/20 rounded-full text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-3xl font-bold text-red-500">Техника Безопасности</h2>
        </div>
        <p className="text-slate-300 text-lg mb-6">
          Сварка — это процесс с повышенной опасностью. Игнорирование правил может привести к потере зрения, ожогам или пожару.
        </p>
        
        <div className="grid gap-4">
          {SAFETY_RULES.map((rule, idx) => (
            <div key={idx} className="flex gap-4 items-start p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <ShieldCheck className="text-green-500 shrink-0 mt-1" size={24} />
              <span className="text-slate-200 font-medium">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Средства Индивидуальной Защиты (СИЗ)</h3>
            <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Маска сварщика (Хамелеон)</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Краги (Спилковые перчатки)</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Роба (Брезент/Спилок)</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Ботинки на толстой подошве</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Респиратор (от аэрозолей)</li>
            </ul>
         </div>
         <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Подготовка места</h3>
            <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Убрать горючие материалы (5-10м)</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Проверить заземление аппарата</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Обеспечить вентиляцию</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Поставить огнетушитель</li>
            </ul>
         </div>
      </div>
    </div>
  );
};

export default Safety;