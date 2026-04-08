import React, { useMemo, useState } from 'react';
import { Hammer } from 'lucide-react';

type PracticeTab = 'notes' | 'presentation' | 'test';

const NOTES_PATH = '/Практическое обучение/1.docx';
const PRESENTATION_PATH = '/Практическое обучение/наплавка валиков.ppt';

type DictationQuestion = {
  id: number;
  start: string;
  answers: string[];
};

const DICTATION_QUESTIONS: DictationQuestion[] = [
  {
    id: 1,
    start: 'Специально оборудованное место для сварки называется …',
    answers: ['сварочный пост'],
  },
  {
    id: 2,
    start: 'Основным оборудованием сварочного поста являются…',
    answers: ['источники питания'],
  },
  {
    id: 3,
    start: 'Для зажатия электрода и подвода к нему сварочного тока служит…',
    answers: ['электрододержатель'],
  },
  {
    id: 4,
    start: 'Для защиты глаз и кожи лица от лучей дуги, брызг металла и шлака предназначены…',
    answers: ['светофильтры или защитные стекла', 'защитные стекла', 'светофильтры'],
  },
  {
    id: 5,
    start: 'Для подвода тока от источника питания к электрододержателю и изделию служат…',
    answers: ['сварочные провода'],
  },
];

const normalizeAnswer = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.,;:!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const buildOfficeEmbedUrl = (relativePath: string | null): string | null => {
  if (!relativePath) return null;
  if (typeof window === 'undefined') return null;
  const fileUrl = `${window.location.origin}${relativePath}`;
  const encoded = encodeURIComponent(fileUrl);
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`;
};

const PracticeTraining: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeTab>('notes');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const notesUrl = useMemo(() => buildOfficeEmbedUrl(NOTES_PATH), []);
  const presentationUrl = useMemo(() => buildOfficeEmbedUrl(PRESENTATION_PATH), []);

  const handleOpenCurrent = () => {
    if (typeof window === 'undefined') return;

    if (activeTab === 'test') return;
    const path = activeTab === 'notes' ? NOTES_PATH : PRESENTATION_PATH;
    const url = `${window.location.origin}${path}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const score = useMemo(() => {
    let correct = 0;
    DICTATION_QUESTIONS.forEach((q) => {
      const given = normalizeAnswer(userAnswers[q.id] ?? '');
      const ok = q.answers.some((a) => normalizeAnswer(a) === given);
      if (ok) correct += 1;
    });
    return { correct, total: DICTATION_QUESTIONS.length };
  }, [userAnswers]);

  const handleCheck = () => setIsChecked(true);
  const handleReset = () => {
    setUserAnswers({});
    setIsChecked(false);
    setCurrentQuestionIndex(0);
  };

  const currentQuestion = DICTATION_QUESTIONS[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === DICTATION_QUESTIONS.length - 1;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/40">
            <Hammer size={20} />
          </span>
          <span className="border-l-4 border-orange-500 pl-4">П/О — Практическое обучение</span>
        </h2>
        <p className="text-slate-400 ml-[3.75rem] max-w-3xl">
          Раздел практического обучения: конспект, презентация и тест. Материалы открываются
          прямо на сайте, в едином формате с остальными разделами.
        </p>
      </header>

      <section className="bg-slate-800/85 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-xl shadow-black/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Наплавка валиков</h3>
            
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-2">
            <div className="inline-flex bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeTab === 'notes'
                    ? 'bg-orange-600 text-white shadow shadow-orange-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Конспект
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presentation')}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeTab === 'presentation'
                    ? 'bg-orange-600 text-white shadow shadow-orange-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Презентация
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('test')}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeTab === 'test'
                    ? 'bg-orange-600 text-white shadow shadow-orange-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Тест
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenCurrent}
              disabled={activeTab === 'test'}
              className="text-xs md:text-[11px] px-3 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Открыть в отдельном окне
            </button>
          </div>
        </div>

        <div className="w-full h-[68vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
          {activeTab === 'notes' && (
            <>
              {notesUrl ? (
                <iframe
                  key={notesUrl}
                  src={notesUrl}
                  className="w-full h-full border-0"
                  title="Практическое обучение — конспект"
                />
              ) : (
                <p className="text-slate-500 text-sm p-4 text-center">
                  Не удалось сформировать ссылку на конспект.
                </p>
              )}
            </>
          )}

          {activeTab === 'presentation' && (
            <>
              {presentationUrl ? (
                <iframe
                  key={presentationUrl}
                  src={presentationUrl}
                  className="w-full h-full border-0"
                  title="Практическое обучение — презентация"
                />
              ) : (
                <p className="text-slate-500 text-sm p-4 text-center">
                  Не удалось сформировать ссылку на презентацию.
                </p>
              )}
            </>
          )}

          {activeTab === 'test' && (
            <div className="w-full h-full overflow-y-auto p-4 md:p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-100">Профессиональный диктант</h4>
                  <p className="text-slate-400 text-sm">
                    Продолжи предложения. После заполнения нажми «Проверить».
                  </p>
                </div>
                {isChecked && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-300 text-sm">
                    Результат: {score.correct} из {score.total}
                  </span>
                )}
              </div>

              <div className="h-2 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / DICTATION_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>

              <div
                className={`rounded-xl border p-3 md:p-4 bg-slate-900/70 ${
                  !isChecked
                    ? 'border-slate-700'
                    : (() => {
                        const given = normalizeAnswer(userAnswers[currentQuestion.id] ?? '');
                        const ok = currentQuestion.answers.some((a) => normalizeAnswer(a) === given);
                        return ok ? 'border-emerald-500/70' : 'border-rose-500/70';
                      })()
                }`}
              >
                <div className="text-xs text-slate-500 mb-1">
                  Задание {currentQuestion.id} из {DICTATION_QUESTIONS.length}
                </div>
                <div className="text-sm text-slate-100 mb-2">{currentQuestion.start}</div>
                <input
                  type="text"
                  value={userAnswers[currentQuestion.id] ?? ''}
                  onChange={(e) =>
                    {
                      setIsChecked(false);
                      setUserAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: e.target.value,
                      }));
                    }
                  }
                  placeholder="Введите продолжение..."
                  className="w-full rounded-md border border-slate-600 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/60"
                />
                {isChecked &&
                  normalizeAnswer(userAnswers[currentQuestion.id] ?? '').length > 0 &&
                  !currentQuestion.answers.some(
                    (a) => normalizeAnswer(a) === normalizeAnswer(userAnswers[currentQuestion.id] ?? '')
                  ) && (
                    <p className="mt-2 text-xs text-rose-300">
                      Эталон: {currentQuestion.answers[0]}
                    </p>
                  )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1 items-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsChecked(false);
                    setCurrentQuestionIndex((idx) => Math.max(0, idx - 1));
                  }}
                  disabled={isFirstQuestion}
                  className="px-3 py-1.5 rounded-md border border-slate-600 text-xs text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChecked(false);
                    setCurrentQuestionIndex((idx) =>
                      Math.min(DICTATION_QUESTIONS.length - 1, idx + 1)
                    );
                  }}
                  disabled={isLastQuestion}
                  className="px-3 py-1.5 rounded-md border border-slate-600 text-xs text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Далее
                </button>
                <button
                  type="button"
                  onClick={handleCheck}
                  className="px-4 py-1.5 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 transition"
                >
                  Проверить
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-md border border-slate-600 text-xs text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition"
                >
                  Сбросить
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PracticeTraining;

