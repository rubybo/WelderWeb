import React from 'react';
import { Download, Gamepad2, PlayCircle } from 'lucide-react';

const GAME_VIDEO_ID = 'ndwwX572MQo';

const GAME_DOWNLOAD_URL = 'https://disk.yandex.by/d/UFi8wYKnsj-SKA';

const buildYouTubeEmbedUrl = (videoId: string): string => {
  const params = new URLSearchParams({
    modestbranding: '1',
    rel: '0',
    iv_load_policy: '3',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
};

const Game: React.FC = () => {
  const embedUrl = buildYouTubeEmbedUrl(GAME_VIDEO_ID);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="space-y-3 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 shadow-sm shadow-black/30">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/40">
            <Gamepad2 size={18} />
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
            Игровой тренажёр по сварке
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
          Практика сварки в формате игры
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Посмотрите обучающий ролик по игре, а затем скачайте сам тренажёр,
          чтобы отработать навыки сварки в безопасной виртуальной среде. <br></br>
          <a className="text-[15px] md:text-xs text-slate-500 text-center" href="https://instruments-game.vercel.app/">Ссылка игра инструменты</a> <a className="text-[19px] md:text-xs text-slate-500 text-center" href="https://hex-game-xi.vercel.app/">Ссылка игра гексы</a>
        </p>
      </header>

      <section className="space-y-6">
        <div className="relative w-full max-w-4xl mx-auto aspect-video bg-black rounded-2xl border border-slate-700 overflow-hidden shadow-2xl shadow-black/60">
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="w-full h-full"
            title="Видеоролик по игре Сварщик"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-900/70 px-3 py-1.5 rounded-full border border-slate-700/80">
            <PlayCircle size={14} className="text-orange-400" />
            <span>Видеоролик по игре «Сварщики»</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <a
            href={GAME_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm md:text-base shadow-lg shadow-orange-600/30 transition-colors"
          >
            <Download size={18} />
            <span>Скачать игру</span>
          </a>
          {/* <p className="text-[11px] md:text-xs text-slate-500 text-center">
            Скачайте игру с Яндекс Диска и распакуйте архив для запуска.
          </p> */}
          
        </div>
      </section>
    </div>
  );
};

export default Game;
