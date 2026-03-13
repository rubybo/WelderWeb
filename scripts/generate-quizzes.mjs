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

async function readLines(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  let text = result.value;
  text = text.replace(/\r/g, '');
  text = text.replace(/\*/g, '');
  return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
}

function isAnswerLetter(line) {
  const cleaned = line.toLowerCase().replace(/[^а-яё]/g, '');
  return cleaned.length === 1 && LETTERS.includes(cleaned);
}

function isQuestionStart(line) {
  return /^(\d+)[\.\)]\s/.test(line) && line.length < 80;
}

async function parseQuizFromFile(filePath, topicId) {
  const lines = await readLines(filePath);
  
  if (lines.length === 0) {
    return null;
  }

  let answerStartIdx = -1;
  for (let i = Math.max(0, lines.length - 60); i < lines.length; i++) {
    if (isAnswerLetter(lines[i])) {
      answerStartIdx = i;
      break;
    }
  }

  if (answerStartIdx === -1) {
    console.warn(`⚠ Нет ответов: ${path.basename(filePath)}`);
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
      if (line.match(/^[абвгдежзи]\)[\s\t]/i) || line.match(/^[абвгдежзи]\s+[а-яё]/i)) {
        const opt = line.replace(/^[абвгдежзи]\)[\s\t]*/, '').replace(/^[абвгдежзи]\s+/, '').trim();
        if (opt.length > 1) {
          currentOptions.push(opt);
        }
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
    console.warn(`⚠ Нет вопросов: ${path.basename(filePath)}`);
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

    return {
      ...q,
      correctIndex
    };
  });

  console.log(`  ✅ ${questionsWithAnswers.length} вопросов`);

  return {
    title: `Тема ${topicId}`,
    questions: questionsWithAnswers
  };
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
