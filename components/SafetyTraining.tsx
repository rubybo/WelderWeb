import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  ArrowRight,
  Sparkles,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';

type Scenario = {
  id: number;
  title: string;
  description: string;
  correctPPE: string[];
  explanation: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Ручная дуговая сварка",
    description: "Сварщик выполняет ручную дуговую сварку металлической конструкции на высоте",
    correctPPE: ["Сварочная маска", "Защитные перчатки", "Кожаный фартук", "Ботинки сварщика", "Защитный костюм"],
    explanation: "При ручной дуговой сварке обязательны: маска для защиты глаз от излучения, перчатки и фартук от брызг, ботинки и костюм для общей защиты."
  },
  {
    id: 2,
    title: "Газовая сварка",
    description: "Работник выполняет газовую сварку медных труб",
    correctPPE: ["Защитные очки", "Термостойкие перчатки", "Кожаный фартук", "Ботинки сварщика"],
    explanation: "При газовой сварке используются очки со светофильтром, термостойкие перчатки и кожаный фартук для защиты от пламени."
  },
  {
    id: 3,
    title: "Резка металла",
    description: "Резка стального листа газорезательным аппаратом",
    correctPPE: ["Защитные очки", "Термостойкие перчатки", "Кожаный фартук", "Ботинки сварщика", "Защитный костюм"],
    explanation: "При резке образуются искры и брызги, поэтому нужен полный комплект защитной одежды из кожи или огнестойких материалов."
  },
  {
    id: 4,
    title: "Зачистка швов",
    description: "Удаление шлака и зачистка сварных швов шлифмашинкой",
    correctPPE: ["Защитные очки", "Защитные перчатки", "Респиратор", "Защитный костюм"],
    explanation: "При зачистке образуется пыль и летят частицы, поэтому нужны очки, перчатки, респиратор и плотный костюм."
  },
  {
    id: 5,
    title: "Работа в замкнутом пространстве",
    description: "Сварка внутри цистерны или резервуара",
    correctPPE: ["Сварочная маска", "Защитные перчатки", "Ботинки сварщика", "Защитный костюм", "Респиратор"],
    explanation: "В замкнутом пространстве обязателен респиратор для защиты от газов, а также полный комплект СИЗ."
  },
  {
    id: 6,
    title: "Сварка алюминия",
    description: "Аргонодуговая сварка алюминиевых конструкций",
    correctPPE: ["Сварочная маска", "Защитные перчатки", "Защитный костюм", "Ботинки сварщика"],
    explanation: "При сварке алюминия используется аргон, маска защищает от УФ излучения, костюм - от брызг расплавленного металла."
  }
];

const ALL_PPE = [
  "Сварочная маска",
  "Защитные очки",
  "Защитные перчатки",
  "Термостойкие перчатки",
  "Кожаный фартук",
  "Респиратор",
  "Ботинки сварщика",
  "Наушники",
  "Защитный костюм",
  "Краги"
];

const PPE_ICONS: Record<string, string> = {
  "Сварочная маска": "🎭",
  "Защитные очки": "👓",
  "Защитные перчатки": "🧤",
  "Термостойкие перчатки": "🔥",
  "Кожаный фартук": "🥋",
  "Респиратор": "😷",
  "Ботинки сварщика": "👢",
  "Наушники": "🎧",
  "Защитный костюм": "🦺",
  "Краги": "💪"
};

const SafetyTraining: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedPPE, setSelectedPPE] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const scenario = SCENARIOS[currentScenario];
  const totalScenarios = SCENARIOS.length;

  const handlePPEtoggle = (ppe: string) => {
    if (showResult) return;
    
    setSelectedPPE(prev => 
      prev.includes(ppe) 
        ? prev.filter(p => p !== ppe)
        : [...prev, ppe]
    );
  };

  const handleCheck = () => {
    setShowResult(true);
    
    const correct = scenario.correctPPE;
    let points = 0;
    
    selectedPPE.forEach(ppe => {
      if (correct.includes(ppe)) {
        points += 20;
      } else {
        points -= 10;
      }
    });
    
    correct.forEach(ppe => {
      if (!selectedPPE.includes(ppe)) {
        points -= 10;
      }
    });
    
    if (points < 0) points = 0;
    setScore(prev => prev + points);
  };

  const handleNext = () => {
    if (currentScenario < totalScenarios - 1) {
      setCurrentScenario(prev => prev + 1);
      setSelectedPPE([]);
      setShowResult(false);
    } else {
      setGameFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentScenario(0);
    setSelectedPPE([]);
    setShowResult(false);
    setScore(0);
    setGameStarted(false);
    setGameFinished(false);
  };

  if (!gameStarted) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/40">
            <Shield className="text-blue-400" size={20} />
            <span className="text-sm font-semibold text-blue-300">Тренажёр</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
            Собери СИЗ
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Выбери правильные средства индивидуальной защиты для каждой ситуации.
            Будь внимателен - неправильный выбор опасен для здоровья!
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCENARIOS.map((s, idx) => (
            <div 
              key={s.id}
              className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-400">{idx + 1}.</span>
                <h3 className="font-semibold text-slate-200">{s.title}</h3>
              </div>
              <p className="text-xs text-slate-400">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setGameStarted(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg shadow-lg shadow-blue-600/30 transition-colors"
          >
            <Target size={24} />
            Начать тренажёр
          </button>
        </div>
      </div>
    );
  }

  if (gameFinished) {
    const maxScore = totalScenarios * 100;
    const percentage = Math.round((score / maxScore) * 100);
    
    let message = '';
    let iconColor = '';
    
    if (percentage >= 90) {
      message = 'Отлично! Ты знаешь всё о СИЗ!';
      iconColor = 'text-green-400';
    } else if (percentage >= 70) {
      message = 'Хорошо! Продолжай изучать ТБ!';
      iconColor = 'text-blue-400';
    } else if (percentage >= 50) {
      message = 'Неплохо, но нужно ещё поучить!';
      iconColor = 'text-yellow-400';
    } else {
      message = 'Изучи правила ТБ ещё раз!';
      iconColor = 'text-red-400';
    }

    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-gradient-to-br from-blue-600/30 to-cyan-600/30">
              <Award size={64} className={iconColor} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-100">Тренажёр завершён!</h2>
          <p className="text-slate-400">{message}</p>
          
          <div className="text-4xl font-bold text-blue-400">
            {score} / {maxScore}
            <span className="text-lg text-slate-400 ml-2">({percentage}%)</span>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              <RotateCcw size={18} />
              Начать заново
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = (ppe: string) => scenario.correctPPE.includes(ppe);
  const progress = ((currentScenario + 1) / totalScenarios) * 100;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Ситуация {currentScenario + 1} из {totalScenarios}</span>
        <span className="text-blue-400 font-bold">{score} баллов</span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="text-blue-400" size={20} />
          <h3 className="text-lg font-bold text-slate-100">{scenario.title}</h3>
        </div>
        <p className="text-sm text-slate-300">{scenario.description}</p>
      </div>

      <div className="text-sm text-slate-400 mb-2">
        Выбери необходимые средства защиты:
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ALL_PPE.map((ppe) => {
          const isSelected = selectedPPE.includes(ppe);
          const correct = isCorrect(ppe);
          
          let buttonClass = 'p-3 rounded-xl border transition-all text-left ';
          
          if (!showResult) {
            buttonClass += isSelected 
              ? 'border-blue-500 bg-blue-500/20 text-blue-100' 
              : 'border-slate-600 bg-slate-800 hover:border-blue-500/50 text-slate-300';
          } else {
            if (correct && isSelected) {
              buttonClass += 'border-green-500 bg-green-500/20 text-green-100';
            } else if (!correct && isSelected) {
              buttonClass += 'border-red-500 bg-red-500/20 text-red-100';
            } else if (correct && !isSelected) {
              buttonClass += 'border-yellow-500 bg-yellow-500/20 text-yellow-100';
            } else {
              buttonClass += 'border-slate-600 bg-slate-800/50 text-slate-500';
            }
          }

          return (
            <button
              key={ppe}
              onClick={() => handlePPEtoggle(ppe)}
              disabled={showResult}
              className={buttonClass}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{PPE_ICONS[ppe] || '⬡'}</span>
                <span className="text-sm">{ppe}</span>
                {showResult && (
                  isSelected ? (
                    correct ? <CheckCircle size={16} className="ml-auto text-green-500" /> : <XCircle size={16} className="ml-auto text-red-500" />
                  ) : correct ? <AlertTriangle size={16} className="ml-auto text-yellow-500" /> : null
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`p-4 rounded-xl border ${scenario.correctPPE.every(p => selectedPPE.includes(p)) && selectedPPE.length === scenario.correctPPE.length ? 'bg-green-500/10 border-green-500/50' : 'bg-yellow-500/10 border-yellow-500/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {scenario.correctPPE.every(p => selectedPPE.includes(p)) && selectedPPE.length === scenario.correctPPE.length ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <AlertTriangle className="text-yellow-400" size={20} />
            )}
            <span className="font-semibold text-slate-200">Пояснение</span>
          </div>
          <p className="text-sm text-slate-300">{scenario.explanation}</p>
          <div className="mt-2 text-xs text-slate-400">
            Правильных ответов: {selectedPPE.filter(p => isCorrect(p)).length} / {scenario.correctPPE.length}
          </div>
        </div>
      )}

      {!showResult ? (
        <button
          onClick={handleCheck}
          disabled={selectedPPE.length === 0}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors"
        >
          Проверить
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {currentScenario < totalScenarios - 1 ? 'Следующая ситуация' : 'Завершить'}
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};

export default SafetyTraining;
