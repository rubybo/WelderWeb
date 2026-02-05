import React, { useState, useRef } from 'react';
import { analyzeWeldImage, fileToBase64 } from '../services/gemini';
import { Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const WeldAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setAnalysis('');
    
    try {
      const base64 = await fileToBase64(file);
      setImage(`data:${file.type};base64,${base64}`);
      
      const result = await analyzeWeldImage(base64, file.type);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Ошибка загрузки или анализа изображения.");
    } finally {
      setLoading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-slate-100 border-l-4 border-orange-500 pl-4">
        Визуальный анализ шва
      </h2>
      <p className="text-slate-400 mb-8 ml-5">
        Загрузите фото вашего сварного шва, и ИИ проанализирует его, найдет ошибки и подскажет, как их исправить.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="flex flex-col gap-4">
          <div 
            onClick={triggerUpload}
            className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all
              ${image ? 'border-orange-500/50 bg-slate-800' : 'border-slate-600 hover:border-orange-400 hover:bg-slate-800/50 bg-slate-800/30'}
            `}
          >
            {image ? (
              <img src={image} alt="Weld" className="h-full w-full object-contain rounded-xl" />
            ) : (
              <div className="text-center p-6">
                <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-300 font-medium">Нажмите для загрузки фото</p>
                <p className="text-slate-500 text-sm mt-2">JPEG, PNG</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          
          <button
            onClick={triggerUpload}
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {loading ? <Loader2 className="animate-spin" /> : <CameraIcon />}
             {image ? "Загрузить другое фото" : "Выбрать фото"}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 min-h-[300px] flex flex-col">
          <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} /> Результат анализа
          </h3>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 animate-pulse">
              <Loader2 size={40} className="animate-spin mb-4 text-orange-500" />
              <p>ИИ рассматривает каждый миллиметр шва...</p>
            </div>
          ) : analysis ? (
            <div className="prose prose-invert prose-sm overflow-y-auto max-h-[500px] custom-scrollbar">
              {analysis.split('\n').map((line, i) => {
                 const trimmed = line.trim();
                 if (trimmed.startsWith('**') && trimmed.endsWith('**')) 
                    return <h4 key={i} className="text-orange-400 font-bold mt-4 mb-2 text-lg">{trimmed.replace(/\*\*/g, '')}</h4>
                 if (trimmed.startsWith('* ') || trimmed.startsWith('- '))
                    return <li key={i} className="text-slate-300 ml-4 mb-1">{trimmed.replace(/^[*|-]\s/, '')}</li>
                 return <p key={i} className="text-slate-300 mb-2">{line}</p>
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
              <AlertTriangle size={40} className="mb-4" />
              <p>Здесь появится отчет</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
)

export default WeldAnalyzer;