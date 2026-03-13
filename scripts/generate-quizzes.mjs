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

async function readText(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value.replace(/\r/g, '').replace(/\*/g, '');
}

function parseFile(text, topicId) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const questions = [];
  let currentQuestion = '';
  let currentOptions = [];
  let correctIdx = -1;
  let inQuestion = false;
  let optionsStarted = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip level markers
    if (line.match(/^i+v?\s*уровень/i) || line.match(/^уровень/i)) continue;
    
    // Question number alone - next line has the question
    if (line.match(/^\d+[\.\)]\s*$/) && i + 1 < lines.length) {
      if (currentQuestion && currentOptions.length >= 2) {
        questions.push({
          text: currentQuestion.replace(/__/g, '').trim(),
          options: currentOptions.filter(o => o.length > 2),
          correctIndex: correctIdx >= 0 ? correctIdx : 0
        });
      }
      currentQuestion = lines[i + 1].replace(/__/g, '').trim();
      currentOptions = [];
      correctIdx = -1;
      optionsStarted = false;
      i++;
      continue;
    }
    
    // Question with text on same line
    const qMatch = line.match(/^(\d+)[\.\)]\s+(.+)/);
    if (qMatch) {
      if (currentQuestion && currentOptions.length >= 2) {
        questions.push({
          text: currentQuestion.replace(/__/g, '').trim(),
          options: currentOptions.filter(o => o.length > 2),
          correctIndex: correctIdx >= 0 ? correctIdx : 0
        });
      }
      currentQuestion = qMatch[2].replace(/__/g, '').trim();
      currentOptions = [];
      correctIdx = -1;
      optionsStarted = false;
      continue;
    }
    
    // Question in __ without number (continuation)
    if (line.startsWith('__') && line.endsWith('__') && !line.match(/^\d/)) {
      if (currentQuestion && currentOptions.length >= 2) {
        questions.push({
          text: currentQuestion.replace(/__/g, '').trim(),
          options: currentOptions.filter(o => o.length > 2),
          correctIndex: correctIdx >= 0 ? correctIdx : 0
        });
      }
      currentQuestion = line.replace(/__/g, '').trim();
      currentOptions = [];
      correctIdx = -1;
      optionsStarted = false;
      continue;
    }
    
    // Option with letter: "а) ..." or "а. ..."
    const optMatch = line.match(/^([абвгдежзи])\)\s+(.+)/i);
    if (optMatch) {
      optionsStarted = true;
      if (line.includes('__')) {
        correctIdx = currentOptions.length;
      }
      currentOptions.push(optMatch[2].replace(/__/g, '').trim());
      continue;
    }
    
    // Option without letter - starts after question, has semicolon or is multi-line
    if (currentQuestion && !optionsStarted && line.length > 3) {
      // Check if line contains semicolons (multiple options on one line)
      if (line.includes(';') || line.includes('¶')) {
        const parts = line.split(/[;¶]/).filter(p => p.trim().length > 2);
        if (parts.length >= 2) {
          optionsStarted = true;
          parts.forEach((part, idx) => {
            const cleaned = part.trim().replace(/__/g, '');
            if (cleaned.length > 2) {
              if (part.includes('__')) correctIdx = currentOptions.length;
              currentOptions.push(cleaned);
            }
          });
          continue;
        }
      }
      
      // Single option on its own line (starts without letter, after question)
      if (!line.match(/^[абвгдежзи]\s/i) && !line.match(/^\d/)) {
        const cleaned = line.replace(/__/g, '').trim();
        if (cleaned.length > 3 && cleaned.length < 100) {
          optionsStarted = true;
          if (line.includes('__')) correctIdx = currentOptions.length;
          currentOptions.push(cleaned);
        }
      }
    }
  }
  
  if (currentQuestion && currentOptions.length >= 2) {
    questions.push({
      text: currentQuestion.replace(/__/g, '').trim(),
      options: currentOptions.filter(o => o.length > 2),
      correctIndex: correctIdx >= 0 ? correctIdx : 0
    });
  }
  
  return questions;
}

function extractAnswers(text) {
  const answers = [];
  const lines = text.split('\n');
  
  for (let i = lines.length - 1; i >= 0 && answers.length < 50; i--) {
    const line = lines[i].trim().replace(/[*_]/g, '');
    
    if (LETTERS.includes(line.toLowerCase()) && line.length === 1) {
      answers.unshift(line.toLowerCase());
    }
  }
  
  return answers;
}

async function parseQuizFromFile(filePath, topicId) {
  const text = await readText(filePath);
  
  let questions = parseFile(text, topicId);
  
  if (questions.length === 0) {
    console.warn(`  ⚠ Нет вопросов: ${path.basename(filePath)}`);
    return null;
  }
  
  // Try to find answers
  const answers = extractAnswers(text);
  
  if (answers.length > 0) {
    const letterToIdx = {};
    LETTERS.forEach((l, i) => letterToIdx[l] = i);
    
    questions = questions.map((q, i) => {
      if (q.correctIndex >= 0) return q;
      
      if (i < answers.length) {
        const ans = answers[i].toLowerCase();
        if (letterToIdx[ans] !== undefined && letterToIdx[ans] < q.options.length) {
          return { ...q, correctIndex: letterToIdx[ans] };
        }
      }
      return { ...q, correctIndex: 0 };
    });
  }
  
  // Filter valid questions
  questions = questions.filter(q => q.options.length >= 2 && q.options.length <= 6);
  
  console.log(`  ✅ ${questions.length} вопросов`);
  
  return { title: `Тема ${topicId}`, questions };
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
    quiz.questions.forEach((q, i) => {
      output += `    { id: ${i+1}, text: ${JSON.stringify(q.text.substring(0, 150))}, options: ${JSON.stringify(q.options)}, correctIndex: ${q.correctIndex} },\n`;
    });
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
