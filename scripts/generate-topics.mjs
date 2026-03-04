import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const WORD_DIR = path.join(projectRoot, 'public', 'word');
const OUTPUT_FILE = path.join(projectRoot, 'topics.ts');

async function extractTopicTitle(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) return null;
  
  const firstLine = lines[0];
  
  if (firstLine.length > 10 && firstLine.length < 200) {
    return firstLine;
  }
  
  return null;
}

async function generate() {
  console.log('📄 Извлечение названий тем из Word документов...');

  const entries = await fs.readdir(WORD_DIR, { withFileTypes: true });

  const topics = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.docx')) continue;

    const base = entry.name.replace(/\.docx$/i, '');
    const topicId = Number.parseInt(base, 10);
    if (!Number.isFinite(topicId)) continue;

    const fullPath = path.join(WORD_DIR, entry.name);

    try {
      const title = await extractTopicTitle(fullPath);
      if (title) {
        topics.push({ id: topicId, title });
        console.log(`→ Тема ${topicId}: ${title.substring(0, 50)}...`);
      }
    } catch (err) {
      console.error(`Ошибка при обработке ${entry.name}:`, err);
    }
  }

  topics.sort((a, b) => a.id - b.id);

  let output = '';
  output += '// Этот файл сгенерирован автоматически скриптом scripts/generate-topics.mjs\n';
  output += '// Не редактируйте его вручную: изменения будут перезаписаны.\n\n';
  output += 'export type TopicMeta = {\n';
  output += '  id: number;\n';
  output += '  title: string;\n';
  output += '};\n\n';
  output += 'export const TOPICS: TopicMeta[] = [\n';

  for (const topic of topics) {
    output += `  { id: ${topic.id}, title: ${JSON.stringify(topic.title)} },\n`;
  }

  output += '];\n';

  await fs.writeFile(OUTPUT_FILE, output, 'utf8');

  console.log(`✅ Файл с темами успешно сгенерирован: ${OUTPUT_FILE} (тем: ${topics.length})`);
}

generate().catch((err) => {
  console.error('Не удалось сгенерировать темы:', err);
  process.exit(1);
});
