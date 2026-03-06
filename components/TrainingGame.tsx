import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Zap, 
  Target, 
  Flame, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Play,
  Trophy,
  Star,
  Timer,
  Sparkles
} from 'lucide-react';
import { QUIZZES } from '../quizzes';
import { TOPICS } from '../topics';

type GameMode = 'menu' | 'arcade' | 'speedrun' | 'endurance';

type Question = {
  id: number;
  topicId: number;
  text: string;
  options: string[];
  correctIndex: number;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TrainingGame: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const allQuestions = useMemo(() => {
    const questions: Question[] = [];
    
    Object.entries(QUIZZES).forEach(([topicIdStr, quiz]) => {
      const topicId = parseInt(topicIdStr);
      
      if (quiz && quiz.questions) {
        quiz.questions.forEach((q) => {
          const optionIndices = q.options.map((_, i) => i);
          const shuffledIndices = shuffleArray(optionIndices);
          
          questions.push({
            id: q.id,
            topicId,
            text: q.text,
            options: shuffledIndices.map(i => q.options[i]),
            correctIndex: shuffledIndices.indexOf(q.correctIndex),
          });
        });
      }
    });
    
    return shuffleArray(questions);
  }, []);

  const startGame = (mode: GameMode) => {
    let gameQuestions: Question[];
    let time = 0;
    
    switch (mode) {
      case 'arcade':
        gameQuestions = allQuestions.slice(0, 10);
        break;
      case 'speedrun':
        gameQuestions = allQuestions.slice(0, 15);
        time = 60;
        break;
      case 'endurance':
        gameQuestions = allQuestions.slice(0, 20);
        break;
      default:
        gameQuestions = allQuestions.slice(0, 10);
    }
    
    setQuestions(shuffleArray(gameQuestions));
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(time);
    setGameOver(false);
    setGameStarted(true);
    setGameMode(mode);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctIndex;
    
    if (isCorrect) {
      setScore(prev => {
        let points = 100;
        if (gameMode === 'arcade') {
          points += streak * 10;
        } else if (gameMode === 'speedrun') {
          points += Math.floor(timeLeft / 2);
        }
        return prev + points;
      });
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
    } else {
      if (gameMode === 'endurance') {
        setGameOver(true);
      }
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setGameStarted(false);
    setGameMode('menu');
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
  };

  if (!gameStarted) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/40">
            <Sparkles className="text-orange-400" size={20} />
            <span className="text-sm font-semibold text-orange-300">Тренажёр</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
            Проверь свои знания!
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Выбери режим и пройди мини-игру, чтобы закрепить материал по сварке
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => startGame('arcade')}
            className="group p-6 rounded-2xl bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 hover:border-orange-500/60 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-orange-600/30">
                <Zap className="text-orange-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Аркада</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              10 вопросов. За каждый правильный ответ + бонус за серию!
            </p>
            <div className="flex items-center gap-2 text-xs text-orange-400">
              <Star size={14} />
              <span>Без ограничения времени</span>
            </div>
          </button>

          <button
            onClick={() => startGame('speedrun')}
            className="group p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/60 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-blue-600/30">
                <Timer className="text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100">На скорость</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              15 вопросов. У тебя есть 60 секунд!
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Flame size={14} />
              <span>Бонус за скорость</span>
            </div>
          </button>

          <button
            onClick={() => startGame('endurance')}
            className="group p-6 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:border-green-500/60 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-green-600/30">
                <Target className="text-green-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Выживание</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              20 вопросов. Одна ошибка - и игра окончена!
            </p>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <Trophy size={14} />
              <span>Рекордный счёт</span>
            </div>
          </button>
        </div>

        <div className="text-center text-slate-500 text-sm">
          Доступно вопросов: {allQuestions.length} из тем: {Object.keys(QUIZZES).length}
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-gradient-to-br from-orange-600/30 to-red-600/30">
              <Trophy size={64} className="text-yellow-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-100">Игра окончена!</h2>
          
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center p-4 rounded-xl bg-slate-800/50">
              <div className="text-2xl font-bold text-orange-400">{score}</div>
              <div className="text-xs text-slate-500">Очки</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50">
              <div className="text-2xl font-bold text-green-400">{maxStreak}</div>
              <div className="text-xs text-slate-500">Серия</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-800/50">
              <div className="text-2xl font-bold text-blue-400">{questions.length}</div>
              <div className="text-xs text-slate-500">Вопросов</div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors"
            >
              <RotateCcw size={18} />
              В меню
            </button>
            <button
              onClick={() => startGame(gameMode)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
            >
              <Play size={18} />
              Играть снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Вопрос</span>
          <span className="font-bold text-slate-200">{currentQuestion + 1}/{questions.length}</span>
        </div>
        <div className="flex items-center gap-4">
          {gameMode === 'speedrun' && (
            <div className={`px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-red-600/30 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
              {timeLeft}с
            </div>
          )}
          <div className="flex items-center gap-1 text-orange-400">
            <Zap size={16} />
            <span className="font-bold">{score}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Flame size={16} />
              <span className="font-bold">x{streak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <p className="text-sm md:text-base text-slate-200">{question.text}</p>
      </div>

      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === question.correctIndex;
          
          let buttonClass = 'w-full p-4 text-left rounded-xl border transition-all ';
          
          if (!showResult) {
            buttonClass += isSelected 
              ? 'border-orange-500 bg-orange-500/20' 
              : 'border-slate-600 bg-slate-800 hover:border-orange-500/50';
          } else {
            if (isCorrect) {
              buttonClass += 'border-green-500 bg-green-500/20';
            } else if (isSelected && !isCorrect) {
              buttonClass += 'border-red-500 bg-red-500/20';
            } else {
              buttonClass += 'border-slate-600 bg-slate-800/50 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={showResult}
              className={buttonClass}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-sm font-medium">
                  {String.fromCharCode(1072 + idx)}
                </span>
                <span className="text-sm">{option}</span>
                {showResult && isCorrect && <CheckCircle size={20} className="text-green-500 ml-auto" />}
                {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-red-500 ml-auto" />}
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors"
        >
          {currentQuestion < questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
        </button>
      )}
    </div>
  );
};

export default TrainingGame;
