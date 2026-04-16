import React, { useMemo, useState } from 'react';
import { Hammer, CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';

type PracticeTab = 'notes' | 'presentation' | 'test';

const NOTES_PATH = '/Практическое обучение/1.docx';
const PRESENTATION_PATH = '/Практическое обучение/наплавка валиков.ppt';

type QuizQuestion = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Сварочный пост – это:',
    options: [
      'рабочее место сварщика, имеющее подвод электроэнергии, оснащенное необходимым сварочным оборудованием и оснасткой',
      'участок производственной площади, на котором осуществляется сварка деталей или узлов',
      'отдельная кабина размером 2 на 2,5 м',
      'источник сварочного тока',
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    text: 'Выберите способы, возбуждающие сварочную дугу:',
    options: [
      'чирканьем',
      'при помощи сварочной цепи',
      'подачей тока',
      'касанием и чирканьем',
      'касанием',
    ],
    correctIndex: 3,
  },
  {
    id: 3,
    text: 'К какому полюсу источника питания подключается электрод при сварке на обратной полярности:',
    options: [
      'к положительному полюсу',
      'к отрицательному полюсу',
      'не имеет значения',
      'нет верного ответа',
    ],
    correctIndex: 0,
  },
  {
    id: 4,
    text: 'Металлическая щетка предназначена:',
    options: [
      'для зачистки сварных швов',
      'для отбивания шлака',
      'для подготовки кромок для сварки',
      'для отбивания брызг застывшего металла',
    ],
    correctIndex: 3,
  },
  {
    id: 5,
    text: 'Какой способ зажигания дуги чаще всего применяется в стесненных условиях?',
    options: [
      'чирканьем',
      'прямым отрывом',
      'касанием под углом',
      'предварительным нагревом',
    ],
    correctIndex: 0,
  },
  {
    id: 6,
    text: 'Выберите нормальную длину дуги при ручной дуговой сварке:',
    options: [
      '0.5-1 мм',
      '3-5 мм',
      '10-15 мм',
      'длину электрода',
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    text: 'Укажите требования к рабочему месту сварщика:',
    options: [
      'особые требования к рабочему месту сварщика не предъявляются',
      'рабочее место сварщика должно быть ограждено',
      'рабочее место сварщика и поверхности свариваемых конструкций должны защищаться от осадков и сильного ветра',
    ],
    correctIndex: 2,
  },
  {
    id: 8,
    text: 'К основным параметрам сварки относятся:',
    options: [
      'сила сварочного тока (Iсв)',
      'марка электрода',
      'положение шва в пространстве',
    ],
    correctIndex: 0,
  },
  {
    id: 9,
    text: 'К дополнительным параметрам сварки относятся:',
    options: [
      'положение шва в пространстве',
      'диаметр электрода',
      'скорость сварки',
    ],
    correctIndex: 1,
  },
  {
    id: 10,
    text: 'Разделка кромок — это...',
    options: [
      'очистка кромок от ржавчины',
      'придание кромкам формы, обеспечивающей доступ дуги к корню шва',
      'правка деформированных кромок',
      'установка зазора между деталями',
    ],
    correctIndex: 1,
  },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const buildOfficeEmbedUrl = (relativePath: string | null): string | null => {
  if (!relativePath) return null;
  if (typeof window === 'undefined') return null;
  const fileUrl = `${window.location.origin}${relativePath}`;
  const encoded = encodeURIComponent(fileUrl);
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`;
};

const PracticeTraining: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PracticeTab>('notes');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  const notesUrl = useMemo(() => buildOfficeEmbedUrl(NOTES_PATH), []);
  const presentationUrl = useMemo(() => buildOfficeEmbedUrl(PRESENTATION_PATH), []);

  const handleOpenCurrent = () => {
    if (typeof window === 'undefined') return;
    if (activeTab === 'test') return;
    const path = activeTab === 'notes' ? NOTES_PATH : PRESENTATION_PATH;
    const url = `${window.location.origin}${path}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleStartQuiz = () => {
    const shuffled = shuffleArray(QUIZ_QUESTIONS).map((q, idx) => {
      const optionIndices = q.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(optionIndices);
      return {
        id: q.id,
        text: q.text,
        options: shuffledIndices.map(i => q.options[i]),
        correctIndex: shuffledIndices.indexOf(q.correctIndex),
      };
    });
    setShuffledQuestions(shuffled);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    if (answerIndex === shuffledQuestions[currentQuestion].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
    setShuffledQuestions([]);
  };

  React.useEffect(() => {
    if (activeTab === 'test' && shuffledQuestions.length === 0) {
      handleStartQuiz();
    }
  }, [activeTab]);

  const questions = shuffledQuestions.length > 0 ? shuffledQuestions : QUIZ_QUESTIONS;
  const question = questions[currentQuestion];
  const totalQuestions = questions.length;

  if (activeTab === 'test' && isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100);
    let message = '';
    let iconColor = '';
    
    if (percentage >= 90) {
      message = 'Отлично! Вы мастер своего дела!';
      iconColor = 'text-green-400';
    } else if (percentage >= 70) {
      message = 'Хорошо! Продолжайте учиться!';
      iconColor = 'text-blue-400';
    } else if (percentage >= 50) {
      message = 'Неплохо, но есть куда расти!';
      iconColor = 'text-yellow-400';
    } else {
      message = 'Стоит повторить материал!';
      iconColor = 'text-red-400';
    }

    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/40">
              <Hammer size={20} />
            </span>
            <span className="border-l-4 border-orange-500 pl-4">П/О — Практическое обучение</span>
          </h2>
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
            <div className="p-4 md:p-6 text-center space-y-4 md:space-y-6">
              <div className="flex justify-center">
                <Award size={48} md:size={64} className={iconColor} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-100">Тест завершён!</h3>
                <p className="text-slate-400 mt-2 text-sm md:text-base">{message}</p>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-orange-500">
                {score} / {totalQuestions}
                <span className="text-base md:text-lg text-slate-400 ml-2">({percentage}%)</span>
              </div>
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors"
              >
                <RotateCcw size={18} />
                Пройти снова
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
            <div className="w-full h-full overflow-y-auto p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs md:text-sm text-slate-400">
                <span>Вопрос {currentQuestion + 1} из {totalQuestions}</span>
                <span className="text-orange-400">Баллы: {score}</span>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              <div className="space-y-3 md:space-y-4">
                <h3 className="text-sm md:text-lg font-medium text-slate-100">{question.text}</h3>
                
                <div className="space-y-2">
                  {question.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === question.correctIndex;
                    
                    let buttonClass = 'w-full p-3 md:p-4 text-left rounded-xl border transition-all ';
                    
                    if (!showResult) {
                      buttonClass += isSelected 
                        ? 'border-orange-500 bg-orange-500/20 text-slate-100' 
                        : 'border-slate-600 bg-slate-800 hover:border-orange-500/50 text-slate-300 hover:text-slate-100';
                    } else {
                      if (isCorrect) {
                        buttonClass += 'border-green-500 bg-green-500/20 text-green-100';
                      } else if (isSelected && !isCorrect) {
                        buttonClass += 'border-red-500 bg-red-500/20 text-red-100';
                      } else {
                        buttonClass += 'border-slate-600 bg-slate-800/50 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-sm font-medium">
                            {String.fromCharCode(1072 + idx)}
                          </span>
                          <span className="flex-1 text-sm md:text-base">{option}</span>
                          {showResult && isCorrect && (
                            <CheckCircle size={18} md:size={20} className="text-green-500 flex-shrink-0" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle size={18} md:size={20} className="text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {showResult && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors"
                  >
                    {currentQuestion < totalQuestions - 1 ? 'Следующий вопрос' : 'Завершить тест'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PracticeTraining;