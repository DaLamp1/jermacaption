import { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

interface FontCache { [key: string]: string; }
interface BrowserPool {
  browser: Browser | null;
  pages: Page[];
  availablePages: Page[];
  inUse: Set<Page>;
  lastUsed: number;
}
const FONT_CACHE: FontCache = {};
const emojiCache = new Map<string, string>();
const BROWSER_POOL: BrowserPool = {
  browser: null, pages: [], availablePages: [], inUse: new Set(), lastUsed: 0
};
const CONFIG = {
  CANVAS_WIDTH: 800, FONT_SIZE: 80, PADDING: 20, BROWSER_TIMEOUT: 10000,
  PAGE_TIMEOUT: 5000, BROWSER_IDLE_TIMEOUT: 300000, EMOJI_SIZE: 60,
  EMOJI_MARGIN: 3, MAX_CONCURRENT_PAGES: 5,
};
const FONT_PATHS = {
  impact: './assets/fonts/Impact.ttf',
  arial: './assets/fonts/Arial.ttf',
  emoji: './assets/fonts/Emoji.ttf'
};

// Preload fonts ONCE at startup
const preloadFonts = async (): Promise<void> =>
  Promise.all(Object.entries(FONT_PATHS).map(
    async ([name, fontPath]) => FONT_CACHE[name] = (await fs.readFile(fontPath)).toString('base64')
  )).then(() => void 0);

// Efficient Browser/Page Pool
const initializeBrowserPool = async (): Promise<void> => {
  if (BROWSER_POOL.browser) return;
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas',
      '--disable-gpu', '--no-zygote', '--single-process', '--disable-extensions',
      '--disable-plugins', '--disable-images', '--disable-javascript'
    ],
    headless: true, timeout: CONFIG.BROWSER_TIMEOUT,
    defaultViewport: { width: CONFIG.CANVAS_WIDTH, height: 100 }
  });
  BROWSER_POOL.browser = browser;
  const pages = await Promise.all(
    Array(CONFIG.MAX_CONCURRENT_PAGES).fill(0).map(async () => {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(CONFIG.PAGE_TIMEOUT);
      page.setDefaultTimeout(CONFIG.PAGE_TIMEOUT);
      return page;
    })
  );
  BROWSER_POOL.pages = pages;
  BROWSER_POOL.availablePages = [...pages];
  BROWSER_POOL.lastUsed = Date.now();
};

const getAvailablePage = async (): Promise<Page> => {
  if (!BROWSER_POOL.browser) await initializeBrowserPool();
  const startTime = Date.now();
  while (BROWSER_POOL.availablePages.length === 0) {
    if (Date.now() - startTime > 5000) throw new Error('No available pages in pool');
    await new Promise(res => setTimeout(res, 5));
  }
  const page = BROWSER_POOL.availablePages.pop()!;
  BROWSER_POOL.inUse.add(page); BROWSER_POOL.lastUsed = Date.now();
  return page;
};
const releasePage = (page: Page): void => {
  if (BROWSER_POOL.inUse.has(page)) {
    BROWSER_POOL.inUse.delete(page);
    BROWSER_POOL.availablePages.push(page);
  }
};

// Fast emoji replacement
const emojiRegex = /<(a?):([^:]+):(\d+)>/g;
const processDiscordEmojis = (input: string): string => {
  if (emojiCache.has(input)) return emojiCache.get(input)!;
  const result = input.replace(emojiRegex, (_, __, name, id) =>
    `<img src="https://cdn.discordapp.com/emojis/${id}.png?size=64" alt="${name}" style="height:${CONFIG.EMOJI_SIZE}px;vertical-align:middle;margin:0 ${CONFIG.EMOJI_MARGIN}px;" crossorigin="anonymous" />`
  );
  emojiCache.set(input, result); return result;
};

// Fast sanitization
const sanitizeHtml = (input: string): string =>
  input.replace(/[&<>"'\/]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;'
  }[c]!));

const processText = (input: string): string => {
  const processedEmojis = processDiscordEmojis(input);
  return processedEmojis.split(/(<img[^>]*>)/).map(part =>
    part.startsWith('<img') ? part : sanitizeHtml(part)
  ).join('');
};

// Pre-compiled HTML template (no repeated font injection)
let cachedHtmlTemplate: string | null = null;
const generateHtml = (text: string, width: number): string => {
  if (!cachedHtmlTemplate) {
    cachedHtmlTemplate = `<!DOCTYPE html>
      <html><head><meta charset="UTF-8"><style>
      @font-face {font-family:'Impact';src:url('data:font/ttf;base64,${FONT_CACHE.impact}');font-display:block;}
      @font-face {font-family:'Arial';src:url('data:font/ttf;base64,${FONT_CACHE.arial}');font-display:block;}
      @font-face {font-family:'Emoji';src:url('data:font/ttf;base64,${FONT_CACHE.emoji}');font-display:block;}
      html,body{width:${width}px;background:white;font-family:'Emoji','Impact','Arial',sans-serif;}
      .container{margin:${CONFIG.PADDING / 2}px;background:white;text-align:center;}
      .text{font-size:${CONFIG.FONT_SIZE}px;color:black;line-height:1.2;word-wrap:break-word;}
      img{max-width:100%;height:auto;}
      </style></head><body>
      <div class="container"><div class="text">{{TEXT}}</div></div>
      </body></html>`;
  }
  return cachedHtmlTemplate.replace('{{TEXT}}', processText(text));
};

const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try { await fs.access(dirPath); } catch { await fs.mkdir(dirPath, { recursive: true }); }
};

// Main image generation
const generateImage = async (text: string, id: string): Promise<string> => {
  if (!text || text.length > 5000) throw new Error('Invalid text');
  const textsDir = './_temp/texts', outputPath = path.join(textsDir, `${id}-text.png`);
  let page: Page | null = null;
  try {
    await ensureDirectoryExists(textsDir);
    const html = generateHtml(text, CONFIG.CANVAS_WIDTH);
    page = await getAvailablePage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: CONFIG.PAGE_TIMEOUT });
    const container = await page.$('.container');
    if (!container) throw new Error('Missing container');
    const boundingBox = await container.boundingBox();
    if (!boundingBox) throw new Error('Missing bounding box');
    const finalHeight = Math.ceil(boundingBox.height) + CONFIG.PADDING;
    await page.screenshot({
      path: outputPath as `${string}.png`,
      type: 'png',
      omitBackground: false,
      clip: { x: 0, y: 0, width: CONFIG.CANVAS_WIDTH, height: finalHeight }
    });
    return outputPath;
  } finally { if (page) releasePage(page); }
};

// Fast browser cleanup
const cleanupBrowser = async (): Promise<void> => {
  if (BROWSER_POOL.browser && BROWSER_POOL.inUse.size === 0) {
    try { await BROWSER_POOL.browser.close(); } catch {}
    BROWSER_POOL.browser = null; BROWSER_POOL.pages = [];
    BROWSER_POOL.availablePages = []; BROWSER_POOL.inUse.clear();
  }
};
setInterval(async () => {
  const now = Date.now();
  if (BROWSER_POOL.browser && BROWSER_POOL.inUse.size === 0 && now - BROWSER_POOL.lastUsed > CONFIG.BROWSER_IDLE_TIMEOUT)
    await cleanupBrowser();
}, 60000);

process.on('SIGINT', cleanupBrowser);
process.on('SIGTERM', cleanupBrowser);

const initializeOptimizations = async (): Promise<void> => {
  await preloadFonts();
  await initializeBrowserPool();
};
initializeOptimizations().catch(console.error);

export { generateImage, initializeOptimizations };
