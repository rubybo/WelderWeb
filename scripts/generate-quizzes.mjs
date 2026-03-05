import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TESTS_DIR = path.join(projectRoot, 'public', 'Раздел контроля знаний');
const OUTPUT_FILE = path.join(projectRoot, 'quizzes.ts');

const LETTERS = ['а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з'];

async function readLines(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value.replace(/\r/g, '');
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function extractNumber(str) {
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function splitQuestionsAndKey(allLines, filePath) {
  const keyPatterns = [
    /ключ/i,
    /ответ/i,
    /ключ.*тест/i,
    /тест.*ответ/i,
    /правильн/i,
  ];

  let keyStartIndex = -1;
  
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    for (const pattern of keyPatterns) {
      if (pattern.test(line) && line.length < 100) {
        keyStartIndex = i;
        break;
      }
    }
    if (keyStartIndex !== -1) break;
  }

  if (keyStartIndex === -1) {
    for (let i = 0; i < allLines.length; i++) {
      if (/^ответ/i.test(allLines[i]) || /ответы:/i.test(allLines[i])) {
        keyStartIndex = i;
        break;
      }
    }
  }

  if (keyStartIndex === -1) {
    console.warn(`⚠ Не найден блок с ключом ответов в файле ${path.basename(filePath)}`);
    return { questionsPartLines: [], keyLines: [] };
  }

  const questionsPartLines = allLines.slice(0, keyStartIndex);
  const keyLines = allLines.slice(keyStartIndex);
  return { questionsPartLines, keyLines };
}

function parseAnswerLetters(keyLines, filePath) {
  const answers = [];
  
  for (const line of keyLines) {
    const cleanLine = line.toLowerCase().replace(/[^\w\sа-яё]/gi, ' ');
    const tokens = cleanLine.split(/\s+/).filter(t => t.length > 0);
    
    for (const token of tokens) {
      if (LETTERS.includes(token)) {
        answers.push(token);
      } else if (/^[а-я]$/i.test(token) && token.length === 1) {
        const lower = token.toLowerCase();
        if (LETTERS.includes(lower)) {
          answers.push(lower);
        }
      }
    }
  }
  
  if (answers.length === 0) {
    console.warn(`⚠ Не найдены ответы в файле ${path.basename(filePath)}`);
  }
  
  return answers;
}

function isOptionLine(line) {
  return /^[\-\u2022•\*]?\s*[абвгдежз]\s*[\).:]\s*/i.test(line) ||
         /^[\-\u2022•\*]?\s*\([абвгдежз]\)\s*/i.test(line) ||
         /^[\-\u2022•\*]?\s*[абвгдежз]\.\s+/i.test(line);
}

function isQuestionNumber(line) {
  return /^\d+[\.\)]?\s/.test(line) && line.length < 30;
}

async function parseQuizFromFile(filePath, topicId) {
  const allLines = await readLines(filePath);
  
  const { questionsPartLines, keyLines } = splitQuestionsAndKey(allLines, filePath);

  if (!questionsPartLines.length || !keyLines.length) {
    return null;
  }

  const answerLetters = parseAnswerLetters(keyLines, filePath);
  const questions = [];
  
  let i = 0;
  let currentQuestion = null;
  let currentOptions = [];

  while (i < questionsPartLines.length) {
    const line = questionsPartLines[i];
    const nextLine = questionsPartLines[i + 1];
    
    if (isOptionLine(line)) {
      const m = line.match(/^[\-\u2022•\*]?\s*([абвгдежз])\s*[\).:]\s*(.*)$/i);
      if (m) {
        currentOptions.push(m[2].trim() || m[1]);
      }
      i++;
      continue;
    }
    
    if (currentOptions.length > 0 && currentQuestion) {
      if (currentOptions.length > 0) {
        questions.push({
          id: questions.length + 1,
          text: currentQuestion,
          options: currentOptions,
        });
      }
      currentQuestion = null;
      currentOptions = [];
    }
    
    if (line.length > 10 && line.length < 500) {
      if (!isQuestionNumber(line) || line.match(/^\d+\s+[А-ЯЁ]/)) {
        if (currentQuestion) {
          currentQuestion += ' ' + line;
        } else {
          currentQuestion = line;
        }
      }
    }
    
    i++;
  }

  if (currentOptions.length > 0 && currentQuestion) {
    questions.push({
      id: questions.length + 1,
      text: currentQuestion,
      options: currentOptions,
    });
  }

  if (questions.length === 0) {
    console.warn(`⚠ Не удалось выделить вопросы из файла ${path.basename(filePath)}`);
    return null;
  }

  const questionsWithAnswers = questions.map((q, index) => {
    const letter = answerLetters[index] || null;
    let correctIndex = 0;

    if (letter) {
      const idx = LETTERS.indexOf(letter);
      if (idx >= 0 && idx < q.options.length) {
        correctIndex = idx;
      }
    }

    return {
      ...q,
      correctIndex,
    };
  });

  return {
    title: `Тема ${topicId}`,
    questions: questionsWithAnswers,
  };
}

async function generate() {
  console.log('📄 Генерация тестов из папки:', TESTS_DIR);

  let entries;
  try {
    entries = await fs.readdir(TESTS_DIR, { withFileTypes: true });
  } catch (err) {
    console.error('Папка с тестами не найдена:', err.message);
    const fallback = `// Этот файл сгенерирован автоматически скриптом scripts/generate-quizzes.mjs
// Не редактируйте его вручную: изменения будут перезаписаны.

export type QuizQuestion = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

export type Quiz = {
  title: string;
  questions: QuizQuestion[];
};

export const QUIZZES: Record<number, Quiz> = {
};
`;
    await fs.writeFile(OUTPUT_FILE, fallback, 'utf8');
    return;
  }

  const quizzes = {};

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.docx')) continue;

    const base = entry.name.replace(/\.docx$/i, '');
    const topicId = Number.parseInt(base, 10);
    if (!Number.isFinite(topicId)) {
      continue;
    }

    const fullPath = path.join(TESTS_DIR, entry.name);
    console.log(`→ Обработка файла ${entry.name} (тема ${topicId})`);

    try {
      const quiz = await parseQuizFromFile(fullPath, topicId);
      if (quiz && quiz.questions.length > 0) {
        quizzes[topicId] = quiz;
        console.log(`  ✅ Найдено вопросов: ${quiz.questions.length}`);
      } else {
        console.log(`  ⚠ Вопросы не найдены`);
      }
    } catch (err) {
      console.error(`  ❌ Ошибка: ${err.message}`);
    }
  }

  const sortedIds = Object.keys(quizzes)
    .map((id) => Number.parseInt(id, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  let output = '';
  output += '// Этот файл сгенерирован автоматически скриптом scripts/generate-quizzes.mjs\n';
  output += '// Не редактируйте его вручную: изменения будут перезаписаны.\n\n';
  output += 'export type QuizQuestion = {\n';
  output += '  id: number;\n';
  output += '  text: string;\n';
  output += '  options: string[];\n';
  output += '  correctIndex: number;\n';
  output += '};\n\n';
  output += 'export type Quiz = {\n';
  output += '  title: string;\n';
  output += '  questions: QuizQuestion[];\n';
  output += '};\n\n';
  output += 'export const QUIZZES: Record<number, Quiz> = {\n';

  for (const id of sortedIds) {
    const quiz = quizzes[id];
    output += `  ${id}: {\n`;
    output += `    title: ${JSON.stringify(quiz.title)},\n`;
    output += '    questions: [\n';
    for (const q of quiz.questions) {
      output += '      {\n';
      output += `        id: ${q.id},\n`;
      output += `        text: ${JSON.stringify(q.text)},\n`;
      output += `        options: ${JSON.stringify(q.options)},\n`;
      output += `        correctIndex: ${q.correctIndex},\n`;
      output += '      },\n';
    }
    output += '    ],\n';
    output += '  },\n';
  }

  output += '};\n';

  await fs.writeFile(OUTPUT_FILE, output, 'utf8');

  console.log(`\n✅ Файл с тестами успешно сгенерирован: ${OUTPUT_FILE}`);
  console.log(`📊 Всего тем с тестами: ${sortedIds.length}`);
}

generate().catch((err) => {
  console.error('Не удалось сгенерировать тесты:', err);
  process.exit(1);
});
