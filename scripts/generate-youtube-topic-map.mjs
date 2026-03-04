import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const YOUTUBE_API_KEY = 'AIzaSyBqqmRcjBz2rSKhy1IGtxp3jTGARr1K8Gk';

const PLAYLISTS = [
  { id: 'PL5qLa3XgKTh6A92exFo_bYHOwDh7GDbyH', key: 'TOPICS' },
  { id: 'PL5qLa3XgKTh6cPsoDVT4g4bwfZ-TvF4Tv', key: 'THEORY' },
];

const OUTPUT_FILE = path.join(projectRoot, 'youtubeTopicMap.ts');

const parseIntSafe = (v) => {
  const n = Number.parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
};

async function fetchPlaylistItems(playlistId) {
  const videos = [];
  let nextPageToken = '';
  
  while (true) {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', YOUTUBE_API_KEY);
    
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }
    
    const res = await fetch(url.toString());
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`YouTube API error: ${res.status} - ${error}`);
    }
    
    const data = await res.json();
    
    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const title = snippet.title;
      const videoId = snippet.resourceId?.videoId;
      
      if (title && videoId && title !== 'Private video' && title !== 'Deleted video') {
        videos.push({ title, videoId });
      }
    }
    
    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
  }
  
  return videos;
}

async function generate() {
  console.log('▶ Генерация карты YouTube (тема → videoId)');
  console.log('→ API Key:', YOUTUBE_API_KEY.substring(0, 10) + '...');

  const results = {};
  
  for (const playlist of PLAYLISTS) {
    console.log(`\n→ Плейлист: ${playlist.id}`);
    
    try {
      const videos = await fetchPlaylistItems(playlist.id);
      console.log(`  Найдено видео: ${videos.length}`);
      
      const map = {};
      
      for (const { title, videoId } of videos) {
        const topicId = parseIntSafe(title);
        if (!topicId) continue;
        
        if (!map[topicId]) {
          map[topicId] = videoId;
          console.log(`  Тема ${topicId}: ${videoId}`);
        }
      }
      
      results[playlist.key] = {
        playlistId: playlist.id,
        map,
        videos,
      };
      
    } catch (e) {
      console.warn(`⚠ Ошибка загрузки плейлиста ${playlist.id}:`, e.message);
      results[playlist.key] = {
        playlistId: playlist.id,
        map: {},
      };
    }
  }

  const topicIds = Object.keys(results.TOPICS?.map ?? {})
    .map((k) => Number.parseInt(k, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  let out = '';
  out += '// Этот файл сгенерирован автоматически скриптом scripts/generate-youtube-topic-map.mjs\n';
  out += '// Не редактируйте его вручную: изменения будут перезаписаны.\n\n';
  out += `export const YOUTUBE_PLAYLIST_ID = ${JSON.stringify(results.TOPICS?.playlistId ?? '')};\n`;
  out += `export const YOUTUBE_THEORY_PLAYLIST_ID = ${JSON.stringify(results.THEORY?.playlistId ?? '')};\n\n`;
  out += 'export const YOUTUBE_TOPIC_TO_VIDEO_ID: Record<number, string> = {\n';
  for (const id of topicIds) {
    out += `  ${id}: ${JSON.stringify(results.TOPICS.map[id])},\n`;
  }
  out += '};\n\n';
  out += 'export const YOUTUBE_THEORY_VIDEOS: { title: string; videoId: string }[] = [\n';
  for (const { title, videoId } of results.THEORY?.videos ?? []) {
    out += `  { title: ${JSON.stringify(title)}, videoId: ${JSON.stringify(videoId) } },\n`;
  }
  out += '];\n';

  await fs.writeFile(OUTPUT_FILE, out, 'utf8');
  console.log(`\n✅ Сгенерировано: ${OUTPUT_FILE} (тем: ${topicIds.length}, теория: ${results.THEORY?.videos?.length ?? 0})`);
}

generate().catch((e) => {
  console.error('❌ Ошибка генерации карты YouTube:', e);
  const fallback = `// Этот файл сгенерирован автоматически скриптом scripts/generate-youtube-topic-map.mjs
// Не редактируйте его вручную: изменения будут перезаписаны.

export const YOUTUBE_PLAYLIST_ID = "";

export const YOUTUBE_THEORY_PLAYLIST_ID = "";

export const YOUTUBE_TOPIC_TO_VIDEO_ID: Record<number, string> = {};

export const YOUTUBE_THEORY_VIDEOS: { title: string; videoId: string }[] = [];
`;
  return fs.writeFile(OUTPUT_FILE, fallback, 'utf8');
});
