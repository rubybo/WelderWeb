import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';

type VideoKey = 'Подготовка металла' | 'Сварка полуавтоматом' | 'Электродная сварка';

const TRAINING_VIDEOS: Record<VideoKey, { title: string; description: string; src: string }> = {
  'Подготовка металла': {
    title: 'Подготовка металла',
    description: 'Подготовка кромок, очистка и разметка — базовые операции перед любой сваркой.',
    src: '/video welder/видео для игры/Подготовка металла/Подготовка металла.mp4',
  },
  'Сварка полуавтоматом': {
    title: 'Сварка полуавтоматом',
    description: 'Настройка полуавтомата, выбор режимов и техника ведения шва MIG/MAG.',
    src: '/video welder/видео для игры/Сварка полуавтоматом/Сварка полуавтоматом.mp4',
  },
  'Электродная сварка': {
    title: 'Электродная сварка',
    description: 'Ручная дуговая сварка покрытым электродом: дуга, положение руки, типичные ошибки.',
    src: '/video welder/видео для игры/Электродная сварка/Электродная сварка.mp4',
  },
};

const Modules: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<VideoKey>('Подготовка металла');

  return (
    <div className="relative">
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-50 border-l-4 border-orange-500 pl-4">
              Теория сварки — обучающие ролики
            </h2>
            <p className="text-slate-300/80 text-sm mt-2 ml-5 max-w-2xl">
              Выберите раздел, чтобы посмотреть соответствующий видеоматериал по подготовке металла,
              сварке полуавтоматом или электродной сварке.
            </p>
          </div>
        </div>

        {/* Обучающие видеоролики по теории */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <PlayCircle size={14} className="text-orange-400" />
              Видеотренажёр по теории
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(TRAINING_VIDEOS) as VideoKey[]).map((key) => {
              const isActive = activeVideo === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveVideo(key)}
                  className={`px-4 py-1.5 text-xs md:text-sm rounded-full border transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white border-orange-500 shadow shadow-orange-500/40'
                      : 'bg-slate-900/70 text-slate-200 border-slate-600 hover:border-orange-500/70 hover:text-white'
                  }`}
                >
                  {TRAINING_VIDEOS[key].title}
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl border border-slate-700 overflow-hidden shadow-2xl shadow-black/60">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/70 via-transparent to-slate-900/10" />
            <video
              key={TRAINING_VIDEOS[activeVideo].src}
              controls
              className="relative z-10 w-full h-full object-contain bg-black"
            >
              <source src={TRAINING_VIDEOS[activeVideo].src} type="video/mp4" />
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
            <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-xs text-slate-200 bg-slate-900/75 px-3 py-1.5 rounded-xl border border-slate-700/80 max-w-[80%]">
              <span className="font-semibold">{TRAINING_VIDEOS[activeVideo].title}</span>
              <span className="text-[11px] text-slate-300">
                {TRAINING_VIDEOS[activeVideo].description}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Modules;