import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TESTS_DIR = path.join(projectRoot, 'public', 'Раздел контроля знаний');
const OUTPUT_FILE = path.join(projectRoot, 'quizzes.ts');

const LETTERS = ['а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'к', 'л', 'м', 'н', 'о', 'п', 'р'];

async function readText(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value.replace(/\r/g, '').replace(/\*/g, '');
}

function isAnswerLetter(line) {
  const cleaned = line.toLowerCase().replace(/[^а-яё]/g, '');
  return cleaned.length === 1 && LETTERS.includes(cleaned);
}

function isQuestionStart(line) {
  return /^(\d+)[\.\)]\s/.test(line) && line.length < 80;
}

async function parseQuizWithBoldAnswers(filePath, topicId) {
  const text = await readText(filePath);
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const questions = [];
  let currentQuestion = '';
  let currentOptions = [];
  let correctOptionIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    
    if (isQuestionStart(line)) {
      if (currentQuestion && currentOptions.length >= 2) {
        questions.push({
          id: questions.length + 1,
          text: currentQuestion.trim(),
          options: currentOptions.map(o => o.trim()).filter(o => o.length > 2),
          correctIndex: correctOptionIdx >= 0 ? correctOptionIdx : 0
        });
      }
      currentQuestion = line.replace(/^\d+[\.\)]\s*/, '').trim();
      currentOptions = [];
      correctOptionIdx = -1;
      continue;
    }
    
    const optionMatch = line.match(/^([абвгдежзи])\)[\s\t]+(.+)/i);
    if (optionMatch) {
      const letter = optionMatch[1].toLowerCase();
      const optText = optionMatch[2].trim();
      
      if (line.includes('__')) {
        correctOptionIdx = currentOptions.length;
      }
      
      currentOptions.push(optText);
    }
  }
  
  if (currentQuestion && currentOptions.length >= 2) {
    questions.push({
      id: questions.length + 1,
      text: currentQuestion.trim(),
      options: currentOptions.map(o => o.trim()).filter(o => o.length > 2),
      correctIndex: correctOptionIdx >= 0 ? correctOptionIdx : 0
    });
  }
  
  if (questions.length > 0) {
    console.log(`  ✅ ${questions.length} вопросов (с __)`);
    return { title: `Тема ${topicId}`, questions };
  }
  return null;
}

async function parseQuizWithAnswers(filePath, topicId) {
  const text = await readText(filePath);
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let answerStartIdx = -1;
  for (let i = Math.max(0, lines.length - 60); i < lines.length; i++) {
    if (isAnswerLetter(lines[i])) {
      answerStartIdx = i;
      break;
    }
  }

  if (answerStartIdx === -1) {
    return null;
  }

  const answerLines = lines.slice(answerStartIdx).filter(l => isAnswerLetter(l));
  
  const questions = [];
  let currentQuestion = '';
  let currentOptions = [];
  let inQuestion = false;

  for (let i = 0; i < answerStartIdx; i++) {
    const line = lines[i];
    
    if (isQuestionStart(line)) {
      if (currentQuestion && currentOptions.length >= 2) {
        questions.push({
          id: questions.length + 1,
          text: currentQuestion.trim(),
          options: currentOptions.map(o => o.trim()).filter(o => o.length > 2)
        });
      }
      currentQuestion = line.replace(/^\d+[\.\)]\s*/, '').trim();
      currentOptions = [];
      inQuestion = true;
      continue;
    }

    if (inQuestion) {
      const optionMatch = line.match(/^([абвгдежзи])\)[\s\t]+(.+)/i);
      if (optionMatch) {
        currentOptions.push(optionMatch[2].trim());
      }
    }
  }

  if (currentQuestion && currentOptions.length >= 2) {
    questions.push({
      id: questions.length + 1,
      text: currentQuestion.trim(),
      options: currentOptions.map(o => o.trim()).filter(o => o.length > 2)
    });
  }

  if (questions.length === 0) {
    return null;
  }

  const letterToIndex = {};
  LETTERS.forEach((letter, idx) => {
    letterToIndex[letter] = idx;
  });

  const questionsWithAnswers = questions.map((q, idx) => {
    let correctIndex = 0;
    
    if (idx < answerLines.length) {
      const answerLetter = answerLines[idx].toLowerCase().replace(/[^а-яё]/g, '');
      const idxAnswer = letterToIndex[answerLetter];
      if (idxAnswer !== undefined && idxAnswer < q.options.length) {
        correctIndex = idxAnswer;
      }
    }

    return { ...q, correctIndex };
  });

  console.log(`  ✅ ${questionsWithAnswers.length} вопросов`);
  return { title: `Тема ${topicId}`, questions: questionsWithAnswers };
}

async function parseQuizFromFile(filePath, topicId) {
  let quiz = await parseQuizWithBoldAnswers(filePath, topicId);
  if (!quiz) {
    quiz = await parseQuizWithAnswers(filePath, topicId);
  }
  return quiz;
}

async function generate() {
  console.log('📄 Генерация тестов...');

  let entries;
  try {
    entries = await fs.readdir(TESTS_DIR, { withFileTypes: true });
  } catch (err) {
    console.error('Папка не найдена:', err.message);
    return;
  }

  const quizzes = {};

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.docx')) continue;

    const base = entry.name.replace(/\.docx$/i, '');
    const topicId = Number.parseInt(base, 10);
    if (!Number.isFinite(topicId)) continue;

    const fullPath = path.join(TESTS_DIR, entry.name);
    console.log(`→ ${entry.name}`);

    try {
      const quiz = await parseQuizFromFile(fullPath, topicId);
      if (quiz && quiz.questions.length > 0) {
        quizzes[topicId] = quiz;
      }
    } catch (err) {
      console.error(`  ❌ ${err.message}`);
    }
  }

  const sortedIds = Object.keys(quizzes).map(id => parseInt(id)).sort((a, b) => a - b);

  let output = '// Автогенерация\n\n';
  output += 'export type QuizQuestion = { id: number; text: string; options: string[]; correctIndex: number; };\n';
  output += 'export type Quiz = { title: string; questions: QuizQuestion[]; };\n';
  output += 'export const QUIZZES: Record<number, Quiz> = {\n';

  for (const id of sortedIds) {
    const quiz = quizzes[id];
    output += `  ${id}: { title: ${JSON.stringify(quiz.title)}, questions: [\n`;
    for (const q of quiz.questions) {
      output += `    { id: ${q.id}, text: ${JSON.stringify(q.text)}, options: ${JSON.stringify(q.options)}, correctIndex: ${q.correctIndex} },\n`;
    }
    output += '  ]},\n';
  }

  output += '};\n';

  await fs.writeFile(OUTPUT_FILE, output, 'utf8');
  console.log(`\n✅ Файл: ${OUTPUT_FILE}`);
  console.log(`📊 Тем: ${sortedIds.length}`);
}

generate().catch(err => {
  console.error('Ошибка:', err);
  process.exit(1);
});
