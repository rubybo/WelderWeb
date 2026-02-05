import React, { useState } from 'react';
import { WELDING_MODULES } from '../constants';
import { WeldingModule } from '../types';
import { ChevronRight, X } from 'lucide-react';

const Modules: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<WeldingModule | null>(null);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-100 border-l-4 border-orange-500 pl-4">
        Виды сварки
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WELDING_MODULES.map((module) => (
          <div 
            key={module.id}
            onClick={() => setSelectedModule(module)}
            className="group bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all shadow-lg hover:shadow-orange-500/20"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src={module.image} 
                alt={module.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-orange-400 border border-orange-500/30">
                {module.difficulty}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-2 text-slate-100 group-hover:text-orange-400 transition-colors">
                {module.title}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                {module.shortDescription}
              </p>
              <div className="flex items-center text-orange-500 text-sm font-medium">
                Подробнее <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail View */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur border-b border-slate-700 p-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-slate-100">{selectedModule.title}</h3>
              <button 
                onClick={() => setSelectedModule(null)}
                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <img 
                src={selectedModule.image} 
                alt={selectedModule.title} 
                className="w-full h-64 object-cover rounded-xl mb-6 border border-slate-600"
              />
              <div className="prose prose-invert max-w-none prose-headings:text-orange-400 prose-a:text-orange-500 prose-strong:text-slate-200">
                {selectedModule.content.split('\n').map((line, idx) => {
                  if (line.trim().startsWith('###')) {
                     return <h3 key={idx} className="text-lg font-bold mt-4 mb-2 text-orange-400">{line.replace('###', '')}</h3>;
                  }
                  if (line.trim().startsWith('*')) {
                     return <li key={idx} className="ml-4 list-disc text-slate-300">{line.replace('*', '')}</li>;
                  }
                  return <p key={idx} className="mb-2 text-slate-300">{line}</p>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;