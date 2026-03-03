import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Плейлист с видео по темам (названия роликов: 1,2,3,...)
const YOUTUBE_PLAYLIST_ID = 'PL5qLa3XgKTh6A92exFo_bYHOwDh7GDbyH';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_PLAYLIST_ID}`;

const OUTPUT_FILE = path.join(projectRoot, 'youtubeTopicMap.ts');

const extractBetween = (s, open, close) => {
  const a = s.indexOf(open);
  if (a === -1) return null;
  const b = s.indexOf(close, a + open.length);
  if (b === -1) return null;
  return s.slice(a + open.length, b).trim();
};

const parseIntSafe = (v) => {
  const n = Number.parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
};

async function generate() {
  console.log('▶ Генерация карты YouTube (тема → videoId)');
  console.log('→ Плейлист:', YOUTUBE_PLAYLIST_ID);

  let map = {};

  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/g) ?? [];

    for (const entry of entries) {
      const title = extractBetween(entry, '<title>', '</title>');
      const videoId =
        extractBetween(entry, '<yt:videoId>', '</yt:videoId>') ??
        extractBetween(entry, '<videoId>', '</videoId>');

      if (!title || !videoId) continue;

      // У тебя название ролика = номер темы (например "12")
      const topicId = parseIntSafe(title);
      if (!topicId) continue;

      if (!map[topicId]) {
        map[topicId] = videoId;
      }
    }
  } catch (e) {
    // Не валим сборку: просто сгенерируем пустую карту и выведем предупреждение.
    console.warn('⚠ Не удалось загрузить RSS плейлиста YouTube. Видео на сайте не будут привязаны.');
    console.warn('Причина:', e?.message ?? e);
    map = {};
  }

  const ids = Object.keys(map)
    .map((k) => Number.parseInt(k, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  let out = '';
  out += '// Этот файл сгенерирован автоматически скриптом scripts/generate-youtube-topic-map.mjs\n';
  out += '// Не редактируйте его вручную: изменения будут перезаписаны.\n\n';
  out += `export const YOUTUBE_PLAYLIST_ID = ${JSON.stringify(YOUTUBE_PLAYLIST_ID)};\n\n`;
  out += 'export const YOUTUBE_TOPIC_TO_VIDEO_ID: Record<number, string> = {\n';
  for (const id of ids) {
    out += `  ${id}: ${JSON.stringify(map[id])},\n`;
  }
  out += '};\n';

  await fs.writeFile(OUTPUT_FILE, out, 'utf8');
  console.log(`✅ Сгенерировано: ${OUTPUT_FILE} (тем: ${ids.length})`);
}

generate().catch((e) => {
  console.error('❌ Ошибка генерации карты YouTube:', e);
  // Не валим сборку — на всякий случай тоже пишем пустую карту
  const fallback = `// Этот файл сгенерирован автоматически скриптом scripts/generate-youtube-topic-map.mjs\n// Не редактируйте его вручную: изменения будут перезаписаны.\n\nexport const YOUTUBE_PLAYLIST_ID = ${JSON.stringify(
    YOUTUBE_PLAYLIST_ID
  )};\n\nexport const YOUTUBE_TOPIC_TO_VIDEO_ID: Record<number, string> = {};\n`;
  return fs.writeFile(OUTPUT_FILE, fallback, 'utf8');
});

