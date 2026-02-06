import React, { useMemo, useState } from 'react';

const TOPIC_NUMBERS = Array.from({ length: 28 }, (_, i) => i + 1);

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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-slate-100 border-l-4 border-orange-500 pl-4">
        Материалы по темам
      </h2>
      <p className="text-slate-400 mb-6 ml-5">
        Откройте конспект или презентацию прямо на сайте. Нумерация тем совпадает с файлами в Word и презентациях.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {TOPIC_NUMBERS.map((n) => (
          <button
            key={n}
            onClick={() => {
              setSelectedTopic(n);
              setActiveTab('word');
            }}
            className={`text-left bg-slate-800 rounded-xl p-4 border transition-all hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20
              ${
                selectedTopic === n
                  ? 'border-orange-500 text-orange-300'
                  : 'border-slate-700 text-slate-200'
              }`}
          >
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Тема {n}
            </div>
            <div className="font-semibold text-base mb-2">Конспект и презентация</div>
            <div className="text-xs text-slate-400">
              Word: {`word/${n}.docx`} <br />
              Презентация:{' '}
              {PRESENTATION_FILES[n] ? PRESENTATION_FILES[n].replace('/present/', '') : 'нет'}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100">
              {selectedTopic ? `Тема ${selectedTopic}` : 'Выберите тему'}
            </h3>
            <p className="text-slate-400 text-sm">
              Просмотр файлов Word и презентаций через Office Online (встраивание в сайт).
            </p>
          </div>
          <div className="inline-flex bg-slate-900 rounded-lg p-1 border border-slate-700">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'word'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setActiveTab('word')}
            >
              Конспект (Word)
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === 'present'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setActiveTab('present')}
            >
              Презентация
            </button>
          </div>
        </div>

        <div className="w-full h-[60vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
          {!selectedTopic && (
            <p className="text-slate-500 text-sm">Выберите тему слева, чтобы открыть материал.</p>
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
                  Убедитесь, что файл доступен по пути {wordPath}.
                </p>
              )}
            </>
          )}

          {selectedTopic && activeTab === 'present' && (
            <>
              {!presentationPath && (
                <p className="text-slate-500 text-sm p-4 text-center">
                  Для этой темы презентация не найдена. Проверьте наличие файла в папке `present`.
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
                  Не удалось сформировать ссылку для просмотра презентации. Убедитесь, что файл
                  доступен по пути {presentationPath}.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Materials;



