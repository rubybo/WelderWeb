import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';
import { QUIZZES } from '../quizzes';

type QuizProps = {
  topicId: number;
};

type ShuffledQuestion = {
  originalIndex: number;
  text: string;
  options: string[];
  correctIndex: number;
  originalCorrectIndex: number;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Quiz: React.FC<QuizProps> = ({ topicId }) => {
  const quiz = QUIZZES[topicId];
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);

  const initializeQuiz = useMemo(() => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return null;
    }

    const shuffled = shuffleArray(quiz.questions).map((q, idx) => {
      const optionIndices = q.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(optionIndices);
      
      return {
        originalIndex: q.id,
        text: q.text,
        options: shuffledIndices.map(i => q.options[i]),
        correctIndex: shuffledIndices.indexOf(q.correctIndex),
        originalCorrectIndex: q.correctIndex,
      };
    });

    return shuffled;
  }, [quiz]);

  const questions = initializeQuiz || [];

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="p-4 text-center text-slate-400">
        Тест для этой темы пока недоступен.
      </div>
    );
  }

  const question = shuffledQuestions.length > 0 ? shuffledQuestions[currentQuestion] : questions[currentQuestion];
  const totalQuestions = shuffledQuestions.length > 0 ? shuffledQuestions.length : questions.length;

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === question.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    const shuffled = shuffleArray(quiz.questions).map((q) => {
      const optionIndices = q.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(optionIndices);
      
      return {
        originalIndex: q.id,
        text: q.text,
        options: shuffledIndices.map(i => q.options[i]),
        correctIndex: shuffledIndices.indexOf(q.correctIndex),
        originalCorrectIndex: q.correctIndex,
      };
    });
    setShuffledQuestions(shuffled);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  // Initialize on first render
  React.useEffect(() => {
    if (shuffledQuestions.length === 0 && questions.length > 0) {
      handleRestart();
    }
  }, []);

  if (isFinished) {
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
      <div className="p-6 text-center space-y-6">
        <div className="flex justify-center">
          <Award size={64} className={iconColor} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-100">Тест завершён!</h3>
          <p className="text-slate-400 mt-2">{message}</p>
        </div>
        <div className="text-4xl font-bold text-orange-500">
          {score} / {totalQuestions}
          <span className="text-lg text-slate-400 ml-2">({percentage}%)</span>
        </div>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors"
        >
          <RotateCcw size={18} />
          Пройти снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Вопрос {currentQuestion + 1} из {totalQuestions}</span>
        <span className="text-orange-400">Баллы: {score}</span>
      </div>
      
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-100">{question.text}</h3>
        
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === question.correctIndex;
            
            let buttonClass = 'w-full p-4 text-left rounded-xl border transition-all ';
            
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
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-sm font-medium">
                    {String.fromCharCode(1072 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle size={20} className="text-red-500" />
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
  );
};

export default Quiz;
