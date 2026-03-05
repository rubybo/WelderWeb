import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { YOUTUBE_THEORY_VIDEOS } from '../youtubeTopicMap';

const buildYouTubeEmbedUrl = (videoId: string): string => {
  const params = new URLSearchParams({
    modestbranding: '1',
    rel: '0',
    iv_load_policy: '3',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
};

type VideoKey = 'Подготовка металла' | 'Сварка полуавтоматом' | 'Электродная сварка';

const VIDEO_DESCRIPTIONS: Record<VideoKey, string> = {
  'Подготовка металла': 'Подготовка кромок, очистка и разметка — базовые операции перед любой сваркой.',
  'Сварка полуавтоматом': 'Настройка полуавтомата, выбор режимов и техника ведения шва MIG/MAG.',
  'Электродная сварка': 'Ручная дуговая сварка покрытым электродом: дуга, положение руки, типичные ошибки.',
};

const getVideoIdByTitle = (title: string): string | null => {
  const video = YOUTUBE_THEORY_VIDEOS.find(v => v.title === title);
  return video?.videoId ?? null;
};

const Modules: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<VideoKey>('Подготовка металла');
  
  const activeVideoId = getVideoIdByTitle(activeVideo);
  const embedUrl = activeVideoId ? buildYouTubeEmbedUrl(activeVideoId) : null;

  return (
    <div className="relative">
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-50 border-l-4 border-orange-500 pl-4">
              Видеоурок 
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
               Видеомастер-класс
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(VIDEO_DESCRIPTIONS) as VideoKey[]).map((key) => {
              const isActive = activeVideo === key;
              const hasVideo = !!getVideoIdByTitle(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveVideo(key)}
                  disabled={!hasVideo}
                  className={`px-4 py-1.5 text-xs md:text-sm rounded-full border transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white border-orange-500 shadow shadow-orange-500/40'
                      : hasVideo
                        ? 'bg-slate-900/70 text-slate-200 border-slate-600 hover:border-orange-500/70 hover:text-white'
                        : 'bg-slate-900/40 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl border border-slate-700 overflow-hidden shadow-2xl shadow-black/60">
            {embedUrl ? (
              <iframe
                key={embedUrl}
                src={embedUrl}
                className="w-full h-full"
                title={activeVideo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Видео недоступно
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-xs text-slate-200 bg-slate-900/75 px-3 py-1.5 rounded-xl border border-slate-700/80 max-w-[80%]">
              <span className="font-semibold">{activeVideo}</span>
              <span className="text-[11px] text-slate-300">
                {VIDEO_DESCRIPTIONS[activeVideo]}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Modules;