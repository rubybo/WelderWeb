import React, { useMemo, useState } from 'react';
import { YOUTUBE_PLAYLIST_ID, YOUTUBE_TOPIC_TO_VIDEO_ID } from '../youtubeTopicMap';
import { TOPICS } from '../topics';
import { QUIZZES } from '../quizzes';
import Quiz from './Quiz';

// Презентации — явное сопоставление, чтобы учесть разные расширения
// ВАЖНО: файлы лежат в папке public/word/present, поэтому путь должен быть /word/present/...
const PRESENTATION_FILES: Record<number, string> = {
  1: '/word/present/1.pptx',
  2: '/word/present/2.pptx',
  3: '/word/present/3.ppt',
  5: '/word/present/5.ppt',
  6: '/word/present/6.ppt',
  7: '/word/present/7.ppt',
  8: '/word/present/8.ppt',
  9: '/word/present/9.ppt',
  10: '/word/present/10.ppt',
  11: '/word/present/11.pptx',
  12: '/word/present/12.pptx',
  13: '/word/present/13.ppt',
  14: '/word/present/14.ppt',
  15: '/word/present/15.ppt',
  16: '/word/present/16.ppt',
  17: '/word/present/17.pptx',
  18: '/word/present/18.pptx',
  19: '/word/present/19.pptx',
  20: '/word/present/20.pptx',
  21: '/word/present/21.pptx',
  22: '/word/present/22.ppsx',
  23: '/word/present/23.ppt',
  24: '/word/present/24.ppt',
  25: '/word/present/25.ppt',
  26: '/word/present/26.pptx',
  27: '/word/present/27.ppt',
  28: '/word/present/28.pptx',
};

// Полностью скрыть имя канала/запретить переход на YouTube нельзя (ограничения YouTube),
// но можно уменьшить брендинг и рекомендации.
const buildYouTubeEmbedUrlByVideoId = (videoId: string): string => {
  const params = new URLSearchParams({
    modestbranding: '1',
    rel: '0',
    iv_load_policy: '3',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
};

type ActiveTab = 'word' | 'present' | 'video' | 'quiz';

const buildOfficeEmbedUrl = (relativePath: string | undefined): string | null => {
  if (!relativePath) return null;
  if (typeof window === 'undefined') return null;
  const fileUrl = `${window.location.origin}${relativePath}`;
  const encoded = encodeURIComponent(fileUrl);
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`;
};

const Materials: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<ActiveTab>('word');
  const [search, setSearch] = useState('');

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return TOPICS;

    return TOPICS.filter((topic) => {
      const numStr = String(topic.id);
      const label = topic.title.toLowerCase();
      return label.includes(query) || numStr.includes(query);
    });
  }, [search]);

  const currentTopic = useMemo(
    () => (selectedTopic ? TOPICS.find((t) => t.id === selectedTopic) ?? null : null),
    [selectedTopic]
  );

  const wordPath = useMemo(() => {
    if (!selectedTopic) return null;
    return `/word/${selectedTopic}.docx`;
  }, [selectedTopic]);

  const presentationPath = useMemo(() => {
    if (!selectedTopic) return undefined;
    return PRESENTATION_FILES[selectedTopic];
  }, [selectedTopic]);
  const videoId = useMemo(() => {
    if (!selectedTopic) return null;
    return YOUTUBE_TOPIC_TO_VIDEO_ID[selectedTopic] ?? null;
  }, [selectedTopic]);

  const videoEmbedUrl = useMemo(
    () => (videoId ? buildYouTubeEmbedUrlByVideoId(videoId) : null),
    [videoId]
  );

  const wordEmbedUrl = useMemo(() => buildOfficeEmbedUrl(wordPath || undefined), [wordPath]);
  const presentationEmbedUrl = useMemo(
    () => buildOfficeEmbedUrl(presentationPath),
    [presentationPath]
  );

  const hasPresentation = !!(selectedTopic && PRESENTATION_FILES[selectedTopic]);
  const hasVideo = !!videoEmbedUrl;

  const handleOpenFileInNewTab = () => {
    if (typeof window === 'undefined') return;

    let path: string | null | undefined = null;

    if (activeTab === 'word') {
      path = wordPath;
    } else if (activeTab === 'present') {
      path = presentationPath;
    } else if (activeTab === 'video') {
      // Для видео открываем конкретный ролик, если нашли его по номеру темы.
      path = videoId
        ? `https://youtu.be/${videoId}`
        : `https://www.youtube.com/playlist?list=${YOUTUBE_PLAYLIST_ID}`;
    }

    if (!path) return;

    // Для http(s) ссылок открываем как есть, для относительных — добавляем origin.
    const isHttp = /^https?:\/\//i.test(path);
    const url = isHttp ? path : `${window.location.origin}${path}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 flex items-center gap-3">
          {/* <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/40">
            📚
          </span> */}
          <span className="border-l-4 border-orange-500 pl-4">Учебно-методический комплекс</span>
        </h2>
        <p className="text-slate-400 ml-[3.75rem] max-w-2xl">
          Выберите тему, чтобы открыть конспект и при наличии презентацию прямо на сайте.
          Нумерация тем полностью совпадает с файлами Word и презентациями.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Левая колонка: поиск и список тем */}
        <aside className="lg:w-1/3 space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 shadow-sm shadow-slate-900/40">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 px-3 py-2 border border-slate-700 focus-within:border-orange-500/70 focus-within:ring-1 focus-within:ring-orange-500/60 transition">
              <span className="text-slate-500 text-sm">🔎</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Быстрый поиск по номеру или названию темы..."
                className="bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500 flex-1"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Очистить
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Введите номер (например, <span className="text-slate-300">5</span>) или просто
              прокрутите список тем ниже.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 max-h-[50vh] md:max-h-[70vh] overflow-y-auto shadow-inner shadow-black/40 touch-pan-y">
            {filteredTopics.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                Темы по запросу не найдены. Попробуйте изменить фильтр.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {filteredTopics.map((topic) => {
                const n = topic.id;
                const isActive = selectedTopic === n;
                const hasPresent = !!PRESENTATION_FILES[n];
                const hasQuiz = !!QUIZZES[n];

                return (
                  <button
                    key={n}
                    onClick={() => {
                      setSelectedTopic(n);
                      setActiveTab('word');
                    }}
                    className={`text-left rounded-xl p-3 md:p-4 border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                      ${
                        isActive
                          ? 'border-orange-500/90 bg-slate-900 text-orange-50 shadow-lg shadow-orange-500/25'
                          : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-orange-500/60 hover:bg-slate-900 hover:shadow-md hover:shadow-orange-500/15'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Тема {n}
                      </div>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/40">
                          выбрано
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-sm mb-1 line-clamp-2">{topic.title}</div>
                    <div className="text-[10px] md:text-[11px] text-slate-400 hidden md:block">
                      Конспект Word{hasPresent && <span className="text-slate-300"> + презентация</span>}{hasQuiz && <span className="text-green-400"> + тест</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-400 hidden lg:flex">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700">
                        Word: word/{n}.docx
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          hasPresent
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900/80 border-slate-700 text-slate-500'
                        }`}
                      >
                        {hasPresent
                          ? `Презентация: ${PRESENTATION_FILES[n].replace('/word/present/', '')}`
                          : 'Презентация не добавлена'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Правая колонка: просмотрщик файлов */}
        <section className="flex-1">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 md:p-6 h-full flex flex-col gap-4 shadow-xl shadow-black/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  {selectedTopic
                    ? currentTopic?.title ?? `Тема ${selectedTopic}`
                    : 'Выберите тему слева'}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Просмотр Word-конспектов, презентаций и видеоуроков (взятых из открытых источников) прямо на сайте. 
                </p>
                {selectedTopic && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300">
                      Word: word/{selectedTopic}.docx
                    </span>
                    {hasPresentation ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-300">
                        Презентация: {PRESENTATION_FILES[selectedTopic].replace('/word/present/', '')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-500">
                        Для этой темы презентация не загружена
                      </span>
                    )}
                    {QUIZZES[selectedTopic] && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/50 text-blue-300">
                        Тест доступен
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-stretch md:items-end gap-2">
                <div className="inline-flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      activeTab === 'word'
                        ? 'bg-orange-600 text-white shadow shadow-orange-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveTab('word')}
                  >
                    Опорный конспект
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      activeTab === 'present'
                        ? 'bg-orange-600 text-white shadow shadow-orange-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveTab('present')}
                  >
                    Презентация
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      activeTab === 'video'
                        ? 'bg-orange-600 text-white shadow shadow-orange-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveTab('video')}
                  >
                    Видео
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      activeTab === 'quiz'
                        ? 'bg-orange-600 text-white shadow shadow-orange-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveTab('quiz')}
                  >
                    Тест
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenFileInNewTab}
                  disabled={
                    !selectedTopic ||
                    (activeTab === 'word' && !wordPath) ||
                    (activeTab === 'present' && !presentationPath)
                  }
                  className="text-xs md:text-[11px] px-3 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Открыть файл в отдельном окне
                </button>
              </div>
            </div>

            <div className="w-full h-[60vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
              {!selectedTopic && (
                <p className="text-slate-500 text-sm px-4 text-center">
                  Выберите тему слева, чтобы открыть конспект или презентацию.
                </p>
              )}

              {selectedTopic && activeTab === 'word' && (
                <>
                  {wordEmbedUrl ? (
                    <iframe
                      key={wordEmbedUrl}
                      src={wordEmbedUrl}
                      className="w-full h-full border-0"
                      title={`Тема ${selectedTopic} — конспект`}
                    />
                  ) : (
                    <p className="text-slate-500 text-sm p-4 text-center">
                      Не удалось сформировать ссылку для просмотра Word-документа.
                      <br />
                      Убедитесь, что файл доступен по пути {wordPath}.
                    </p>
                  )}
                </>
              )}

              {selectedTopic && activeTab === 'present' && (
                <>
                  {!presentationPath && (
                    <p className="text-slate-500 text-sm p-4 text-center">
                      Для этой темы презентация не найдена. Проверьте наличие файла в папке
                      <span className="text-slate-300"> /public/word/present</span>.
                    </p>
                  )}
                  {presentationPath && presentationEmbedUrl && (
                    <iframe
                      key={presentationEmbedUrl}
                      src={presentationEmbedUrl}
                      className="w-full h-full border-0"
                      title={`Тема ${selectedTopic} — презентация`}
                    />
                  )}
                  {presentationPath && !presentationEmbedUrl && (
                    <p className="text-slate-500 text-sm p-4 text-center">
                      Не удалось сформировать ссылку для просмотра презентации.
                      <br />
                      Убедитесь, что файл доступен по пути {presentationPath}.
                    </p>
                  )}
                </>
              )}

              {selectedTopic && activeTab === 'video' && (
                <>
                  {videoEmbedUrl ? (
                    <iframe
                      key={videoEmbedUrl}
                      src={videoEmbedUrl}
                      className="w-full h-full border-0"
                      title={`Тема ${selectedTopic}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <p className="text-slate-500 text-sm p-4 text-center">
                      Для этой темы видеоурок не найден. Запусти генерацию карты YouTube и пересобери сайт:
                      <br />
                      <span className="text-slate-300">npm run generate:ytmap</span>
                      <br />
                      Затем обнови страницу.
                    </p>
                  )}
                </>
              )}

              {selectedTopic && activeTab === 'quiz' && (
                <div className="w-full h-full overflow-y-auto p-4">
                  <Quiz topicId={selectedTopic} />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Materials;
