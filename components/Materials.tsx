import React, { useMemo, useState } from 'react';

type TopicMeta = {
  id: number;
  title: string;
};

// Здесь можно вписать реальные названия тем из ваших Word‑конспектов
const TOPICS: TopicMeta[] = [
  { id: 1, title: 'Тема 1' },
  { id: 2, title: 'Тема 2' },
  { id: 3, title: 'Тема 3' },
  { id: 4, title: 'Тема 4' },
  { id: 5, title: 'Тема 5' },
  { id: 6, title: 'Тема 6' },
  { id: 7, title: 'Тема 7' },
  { id: 8, title: 'Тема 8' },
  { id: 9, title: 'Тема 9' },
  { id: 10, title: 'Тема 10' },
  { id: 11, title: 'Тема 11' },
  { id: 12, title: 'Тема 12' },
  { id: 13, title: 'Тема 13' },
  { id: 14, title: 'Тема 14' },
  { id: 15, title: 'Тема 15' },
  { id: 16, title: 'Тема 16' },
  { id: 17, title: 'Тема 17' },
  { id: 18, title: 'Тема 18' },
  { id: 19, title: 'Тема 19' },
  { id: 20, title: 'Тема 20' },
  { id: 21, title: 'Тема 21' },
  { id: 22, title: 'Тема 22' },
  { id: 23, title: 'Тема 23' },
  { id: 24, title: 'Тема 24' },
  { id: 25, title: 'Тема 25' },
  { id: 26, title: 'Тема 26' },
  { id: 27, title: 'Тема 27' },
  { id: 28, title: 'Тема 28' },
];

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

type ActiveTab = 'word' | 'present';

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

  const wordEmbedUrl = useMemo(() => buildOfficeEmbedUrl(wordPath || undefined), [wordPath]);
  const presentationEmbedUrl = useMemo(
    () => buildOfficeEmbedUrl(presentationPath),
    [presentationPath]
  );

  const hasPresentation = !!(selectedTopic && PRESENTATION_FILES[selectedTopic]);

  const handleOpenFileInNewTab = () => {
    if (typeof window === 'undefined') return;

    const path = activeTab === 'word' ? wordPath : presentationPath;
    if (!path) return;

    const fileUrl = `${window.location.origin}${path}`;
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/40">
            📚
          </span>
          <span className="border-l-4 border-orange-500 pl-4">Материалы по темам</span>
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

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 max-h-[70vh] overflow-y-auto shadow-inner shadow-black/40">
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

                return (
                  <button
                    key={n}
                    onClick={() => {
                      setSelectedTopic(n);
                      setActiveTab('word');
                    }}
                    className={`text-left rounded-xl p-4 border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
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
                    <div className="font-semibold text-sm mb-1">{topic.title}</div>
                    <div className="text-[11px] text-slate-400 mb-1">
                      Конспект Word{hasPresent && <span className="text-slate-300"> + презентация</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400">
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
                  Просмотр Word-конспектов и презентаций через встроенный Office Online.
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
                    Конспект (Word)
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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Materials;
