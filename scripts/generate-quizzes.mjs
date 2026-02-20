import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TESTS_DIR = path.join(projectRoot, 'public', 'Раздел контроля знаний');
const OUTPUT_FILE = path.join(projectRoot, 'quizzes.ts');

// Допустимые буквы вариантов ответов
const LETTERS = ['а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з'];

/**
 * Чтение и нормализация строк из docx.
 */
async function readLines(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value.replace(/\r/g, '');
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Поиск блока с ответами.
 * Поддерживает варианты:
 * - строка, содержащая фразу "Ключ к тестовым заданиям"
 * - таблица с заголовками "задание" / "ответ"
 */
function splitQuestionsAndKey(allLines, filePath) {
  // 1. Пытаемся найти строку с текстом "Ключ ... тест..."
  let keyStartIndex = allLines.findIndex(
    (l) => /ключ/i.test(l) && /тест/i.test(l)
  );

  // 2. Если не нашли, пробуем по схеме "задание / ответ"
  if (keyStartIndex === -1) {
    const zadanieIdx = allLines.findIndex((l) => /^задан[иея]/i.test(l));
    const otvetIdx = allLines.findIndex(
      (l, idx) => idx > zadanieIdx && /^ответ/i.test(l)
    );

    if (zadanieIdx !== -1 && otvetIdx !== -1) {
      keyStartIndex = zadanieIdx; // всё, что ниже, считаем блоком ключа
    }
  }

  if (keyStartIndex === -1) {
    console.warn(
      `⚠ Не найден блок с ключом ответов в файле ${path.basename(filePath)}`
    );
    return { questionsPartLines: [], keyLines: [] };
  }

  const questionsPartLines = allLines.slice(0, keyStartIndex);
  const keyLines = allLines.slice(keyStartIndex);
  return { questionsPartLines, keyLines };
}

/**
 * Парсинг строки с ответами вида:
 * "ответ  а  б  а  б  в  в  а  универсальных"
 */
function parseAnswerLetters(keyLines, filePath) {
  const answerLine = keyLines.find((l) => /^ответ/i.test(l));
  if (!answerLine) {
    console.warn(
      `⚠ Не найдена строка с ответами (начинающаяся с "ответ") в файле ${path.basename(
        filePath
      )}`
    );
    return [];
  }

  const answerTokens = answerLine
    .split(/\s+/)
    .slice(1)
    .filter((t) => t.length > 0);

  // Берём только односимвольные буквы а/б/в/...
  return answerTokens
    .map((t) => t.toLowerCase())
    .filter((t) => t.length === 1 && LETTERS.includes(t));
}

/**
 * Парсинг текстового содержимого одного docx-файла с тестом.
 * Ожидается структура:
 * - блок вопросов с вариантами а), б), в)...
 * - затем блок с ключом ответов (см. splitQuestionsAndKey)
 */
async function parseQuizFromFile(filePath, topicId) {
  const allLines = await readLines(filePath);

  const { questionsPartLines, keyLines } = splitQuestionsAndKey(
    allLines,
    filePath
  );

  if (!questionsPartLines.length || !keyLines.length) {
    return null;
  }

  const answerLetters = parseAnswerLetters(keyLines, filePath);

  const questions = [];
  let i = 0;

  // Строка варианта: "[маркер] а) текст" или "[маркер] а. текст"
  const isOptionLine = (line) =>
    /^[\-\u2022]?\s*[абвгдежз]\s*[\).]/i.test(line);

  while (i < questionsPartLines.length) {
    const line = questionsPartLines[i];

    // Пропускаем строки, которые начинаются как вариант ответа,
    // но не привязаны к вопросу (защита от "висячих" строк)
    if (isOptionLine(line)) {
      i += 1;
      continue;
    }

    // Собираем текст вопроса до первой строки с вариантом ответа
    const qLines = [];
    qLines.push(line);
    i += 1;

    while (i < questionsPartLines.length && !isOptionLine(questionsPartLines[i])) {
      qLines.push(questionsPartLines[i]);
      i += 1;
    }

    // Теперь собираем варианты
    const options = [];
    while (i < questionsPartLines.length && isOptionLine(questionsPartLines[i])) {
      const optLine = questionsPartLines[i];
      const m = optLine.match(/^[\-\u2022]?\s*([абвгдежз])\s*[\).]\s*(.*)$/i);
      if (m) {
        options.push(m[2].trim());
      }
      i += 1;
    }

    if (options.length > 0) {
      const textQuestion = qLines.join(' ').replace(/\s+/g, ' ').trim();
      questions.push({
        id: questions.length + 1,
        text: textQuestion,
        options,
      });
    }
  }

  if (questions.length === 0) {
    console.warn(
      `⚠ Не удалось выделить ни одного вопроса из файла ${path.basename(
        filePath
      )}`
    );
    return null;
  }

  // Привязываем буквы-ответы к вариантам
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

  const entries = await fs.readdir(TESTS_DIR, { withFileTypes: true });

  const quizzes = {};

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.docx')) continue;

    const base = entry.name.replace(/\.docx$/i, '');
    const topicId = Number.parseInt(base, 10);
    if (!Number.isFinite(topicId)) {
      // пропускаем файлы типа ОКР.docx, Перечень тем.docx
      continue;
    }

    const fullPath = path.join(TESTS_DIR, entry.name);
    console.log(`→ Обработка файла ${entry.name} (тема ${topicId})`);

    try {
      const quiz = await parseQuizFromFile(fullPath, topicId);
      if (quiz && quiz.questions.length > 0) {
        quizzes[topicId] = quiz;
      }
    } catch (err) {
      console.error(`Ошибка при обработке ${entry.name}:`, err);
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

  console.log(`✅ Файл с тестами успешно сгенерирован: ${OUTPUT_FILE}`);
}

generate().catch((err) => {
  console.error('Не удалось сгенерировать тесты:', err);
  process.exit(1);
});

