import React, { useEffect, useMemo, useState } from 'react';
import { QUIZZES, type Quiz } from '../quizzes';

type TopicMeta = {
  id: number;
  title: string;
};

// Здесь можно вписать реальные названия тем из ваших Word‑конспектов
const TOPICS: TopicMeta[] = [
  { id: 1, title: 'Введение в профессию сварщика и область применения сварки' },
  { id: 2, title: 'Техника безопасности и средства индивидуальной защиты' },
  { id: 3, title: 'Сварочное оборудование: инверторы, кабели, держатели' },
  { id: 4, title: 'Электрическая дуга и основы сварочной электротехники' },
  { id: 5, title: 'Сварные соединения, швы и типы разделки кромок' },
  { id: 6, title: 'Положение шва в пространстве и влияние на технологию' },
  { id: 7, title: 'Электроды для ручной дуговой сварки: марки, выбор, хранение' },
  { id: 8, title: 'Подготовка металла к сварке: очистка, разделка, прихватки' },
  { id: 9, title: 'Режимы сварки: сила тока, напряжение, скорость, полярность' },
  { id: 10, title: 'Сварка углеродистых сталей: особенности и режимы' },
  { id: 11, title: 'Сварка низколегированных и легированных сталей' },
  { id: 12, title: 'Сварка нержавеющих сталей: дефекты и их предупреждение' },
  { id: 13, title: 'Сварка чугуна и цветных металлов (алюминий, медь и др.)' },
  { id: 14, title: 'Дефекты сварных швов: виды, причины, способы устранения' },
  { id: 15, title: 'Контроль качества сварных соединений: визуальный и НК' },
  { id: 16, title: 'Основы полуавтоматической сварки в среде защитных газов (MIG/MAG)' },
  { id: 17, title: 'Настройка полуавтомата: подача проволоки, газ, индуктивность' },
  { id: 18, title: 'Особенности сварки тонколистового металла и кузовной ремонт' },
  { id: 19, title: 'Аргонодуговая сварка (TIG): оборудование и подготовка' },
  { id: 20, title: 'Техника выполнения TIG‑сварки и типичные ошибки' },
  { id: 21, title: 'Сварка труб: стыковые и угловые соединения, корень шва' },
  { id: 22, title: 'Сварка конструкций из профиля: рамы, каркасы, фермы' },
  { id: 23, title: 'Термическая резка металла: газовая, плазменная, дуговая' },
  { id: 24, title: 'Деформации и напряжения при сварке, способы их снижения' },
  { id: 25, title: 'Организация рабочего места сварщика и эргономика' },
  { id: 26, title: 'Документация сварочных работ: чертежи, условные обозначения' },
  { id: 27, title: 'Типовые ошибки начинающих сварщиков и как их избежать' },
  { id: 28, title: 'Итоговая тема: комплексные сварочные задания и разбор работ' },
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

// Видеофайлы: по умолчанию предполагаем, что имя совпадает с номером темы (N.mp4)
// и лежит в папке public/video welder → в браузере путь будет /video welder/N.mp4
// Если каких‑то файлов ещё нет, плеер просто не сможет их воспроизвести, но интерфейс останется тем же.
const buildVideoPath = (topicId: number | null): string | null => {
  if (!topicId) return null;
  // Прямой путь с пробелом, браузер сам закодирует его как %20
  return `/video welder/${topicId}.mp4`;
};

// Тестовые материалы: файлы лежат в папке public/Раздел контроля знаний, имена также совпадают с номером темы (N.docx)
const buildTestPath = (topicId: number | null): string | null => {
  if (!topicId) return null;
  return `/Раздел контроля знаний/${topicId}.docx`;
};

type ActiveTab = 'word' | 'present' | 'video' | 'test';

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
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

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

  const currentQuiz: Quiz | null = useMemo(
    () => (selectedTopic ? QUIZZES[selectedTopic] ?? null : null),
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

  const videoPath = useMemo(() => buildVideoPath(selectedTopic), [selectedTopic]);
  const testPath = useMemo(() => buildTestPath(selectedTopic), [selectedTopic]);

  const wordEmbedUrl = useMemo(() => buildOfficeEmbedUrl(wordPath || undefined), [wordPath]);
  const presentationEmbedUrl = useMemo(
    () => buildOfficeEmbedUrl(presentationPath),
    [presentationPath]
  );
  const testEmbedUrl = useMemo(() => buildOfficeEmbedUrl(testPath || undefined), [testPath]);

  const hasPresentation = !!(selectedTopic && PRESENTATION_FILES[selectedTopic]);
  const hasVideo = !!videoPath;
  const hasTest = !!testPath;

  // Сброс теста при смене темы или переключении вкладки
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore({ correct: 0, total: 0 });
  }, [selectedTopic, activeTab]);

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    let correct = 0;
    const total = currentQuiz.questions.length;

    currentQuiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });

    setQuizScore({ correct, total });
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore({ correct: 0, total: 0 });
  };

  const handleOpenFileInNewTab = () => {
    if (typeof window === 'undefined') return;

    let path: string | null | undefined = null;

    if (activeTab === 'word') path = wordPath;
    else if (activeTab === 'present') path = presentationPath;
    else if (activeTab === 'video') path = videoPath;
    else if (activeTab === 'test') path = testPath;

    if (!path) return;

    const fileUrl = `${window.location.origin}${path}`;
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 flex items-center gap-3">
          
          <span className="border-l-4 border-orange-500 pl-4">Опорный конспект</span>
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
                        {/* Тема {n} */}
                      </div>
                      {/* {isActive && (
                        // <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/40">
                        //   выбрано
                        // </span>
                      )} */}
                    </div>
                    <div className="font-semibold text-sm mb-1">{topic.title}</div>
                    <div className="text-[11px] text-slate-400 mb-1">
                      Опорный конспект{hasPresent && <span className="text-slate-300"> + презентация</span>}
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
                  Просмотр Word-конспектов, презентаций, видеоуроков и тестов прямо на сайте.
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
                    {hasVideo ? (
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/50 text-sky-300">
                        Видео: {selectedTopic}.mp4
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-500">
                        Видеофайл можно добавить как {selectedTopic}.mp4 в папку public/video welder
                      </span>
                    )}
                    {hasTest ? (
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/50 text-violet-300">
                        Тест: Раздел контроля знаний/{selectedTopic}.docx
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-500">
                        Тест для этой темы можно добавить в папку public/Раздел контроля знаний
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
                      activeTab === 'test'
                        ? 'bg-orange-600 text-white shadow shadow-orange-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveTab('test')}
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
                    (activeTab === 'present' && !presentationPath) ||
                    (activeTab === 'video' && !videoPath) ||
                    (activeTab === 'test' && !testPath)
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
                  {!videoPath && (
                    <p className="text-slate-500 text-sm p-4 text-center">
                      Для этой темы видеоролик не найден. Добавьте файл
                      <span className="text-slate-300"> {selectedTopic}.mp4</span> в папку
                      <span className="text-slate-300"> public/video welder</span>.
                    </p>
                  )}
                  {videoPath && (
                    <video
                      key={videoPath}
                      controls
                      className="w-full h-full bg-black"
                    >
                      <source src={videoPath} type="video/mp4" />
                      Ваш браузер не поддерживает воспроизведение видео.
                    </video>
                  )}
                </>
              )}

              {selectedTopic && activeTab === 'test' && (
                <>
                  {currentQuiz ? (
                    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-100">
                            Тест по теме {selectedTopic}: {currentQuiz.title}
                          </h4>
                          <p className="text-slate-400 text-xs mt-1">
                            Выберите варианты ответов, затем нажмите «Проверить результат».
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {quizSubmitted && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-300">
                              Результат: {quizScore.correct} из {quizScore.total}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {currentQuiz.questions.map((q, idx) => {
                          const selected = quizAnswers[q.id] ?? null;
                          const isCorrect = quizSubmitted && selected === q.correctIndex;
                          const isIncorrect =
                            quizSubmitted && selected !== null && selected !== q.correctIndex;

                          return (
                            <div
                              key={q.id}
                              className={`rounded-xl border p-3 md:p-4 bg-slate-900/70 ${
                                isCorrect
                                  ? 'border-emerald-500/70'
                                  : isIncorrect
                                  ? 'border-rose-500/70'
                                  : 'border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="text-xs uppercase tracking-wide text-slate-500">
                                  Вопрос {idx + 1}
                                </div>
                                {quizSubmitted && (
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                      isCorrect
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                                        : isIncorrect
                                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                                        : 'bg-slate-800 border-slate-600 text-slate-300'
                                    }`}
                                  >
                                    {isCorrect
                                      ? 'верно'
                                      : isIncorrect
                                      ? 'неверно'
                                      : 'ответ не проверен'}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm font-medium text-slate-100 mb-2">
                                {q.text}
                              </div>
                              <div className="space-y-1.5">
                                {q.options.map((opt, optIndex) => {
                                  const isSelected = selected === optIndex;
                                  const isRightOption = q.correctIndex === optIndex;

                                  let optionClasses =
                                    'w-full text-left px-3 py-1.5 rounded-md border text-xs md:text-sm transition-colors';

                                  if (!quizSubmitted) {
                                    optionClasses += isSelected
                                      ? ' border-orange-500 bg-orange-500/10 text-orange-100'
                                      : ' border-slate-700 bg-slate-900/80 text-slate-200 hover:border-orange-500/60 hover:bg-slate-800';
                                  } else {
                                    if (isRightOption) {
                                      optionClasses += ' border-emerald-500 bg-emerald-500/10 text-emerald-100';
                                    } else if (isSelected && !isRightOption) {
                                      optionClasses += ' border-rose-500 bg-rose-500/10 text-rose-100';
                                    } else {
                                      optionClasses += ' border-slate-700 bg-slate-900/80 text-slate-400';
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIndex}
                                      type="button"
                                      className={optionClasses}
                                      onClick={() => handleSelectAnswer(q.id, optIndex)}
                                      disabled={quizSubmitted}
                                    >
                                      <span className="mr-2 text-[11px] text-slate-400">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          className="px-4 py-1.5 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!currentQuiz.questions.length}
                        >
                          Проверить результат
                        </button>
                        <button
                          type="button"
                          onClick={handleResetQuiz}
                          className="px-3 py-1.5 rounded-md border border-slate-600 text-xs text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition"
                        >
                          Сбросить ответы
                        </button>
                        {testPath && testEmbedUrl && (
                          <span className="text-[11px] text-slate-500">
                            Для печати можно открыть исходный файл теста:
                            <button
                              type="button"
                              className="ml-1 text-orange-400 hover:text-orange-300 underline decoration-dotted"
                              onClick={handleOpenFileInNewTab}
                            >
                              Раздел контроля знаний/{selectedTopic}.docx
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center px-4 text-center space-y-3">
                      <p className="text-slate-500 text-sm">
                        Интерактивный тест для этой темы пока не добавлен.
                      </p>
                      {testPath && testEmbedUrl ? (
                        <p className="text-[11px] text-slate-500 max-w-md">
                          Файл теста существует как Word-документ по пути{' '}
                          <span className="text-slate-300">
                            Раздел контроля знаний/{selectedTopic}.docx
                          </span>
                          . Его можно открыть в отдельном окне для печати.
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 max-w-md">
                          Добавьте вопросы для этой темы в код (объект <span className="text-slate-300">QUIZZES</span>),
                          чтобы тест стал доступен на сайте. Номер темы должен совпадать с номером файла в папке
                          <span className="text-slate-300"> «Раздел контроля знаний»</span>.
                        </p>
                      )}
                    </div>
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
