import { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

interface BrowserPool {
  browser: Browser | null;
  pages: Page[];
  availablePages: Page[];
  inUse: Set<Page>;
  lastUsed: number;
  pageReuseCount: Map<Page, number>;
  MAX_PAGE_REUSE: number;
}

// Font cache with TTL handled externally
type FontCacheValue = string;
const FONT_CACHE: Record<string, FontCacheValue> = {};
const FONT_TIMESTAMPS = new Map<string, number>();
const FONT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const CONFIG = {
  CANVAS_WIDTH: 800,
  FONT_SIZE: 80,
  PADDING: 20,
  BROWSER_TIMEOUT: 10000,
  PAGE_TIMEOUT: 5000,
  BROWSER_IDLE_TIMEOUT: 300000,
  EMOJI_SIZE: 60,
  EMOJI_MARGIN: 3,
  MAX_CONCURRENT_PAGES: 5,
};

const FONT_PATHS = {
  impact: './assets/fonts/Impact.ttf',
  arial: './assets/fonts/Arial.ttf',
  emoji: './assets/fonts/Emoji.ttf'
};

// LRU cache for emojis
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      // Fix: Only delete if there is a key
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey as K);
      }
    }
    this.cache.set(key, value);
  }
}

const EMOJI_CACHE_SIZE = 1000;
const emojiCache = new LRUCache<string, string>(EMOJI_CACHE_SIZE);

const htmlTemplateCache = new Map<number, string>();

const BROWSER_POOL: BrowserPool = {
  browser: null,
  pages: [],
  availablePages: [],
  inUse: new Set(),
  lastUsed: 0,
  pageReuseCount: new Map<Page, number>(),
  MAX_PAGE_REUSE: 100
};

const preloadFonts = async (): Promise<void> => {
  await Promise.all(
    Object.entries(FONT_PATHS).map(async ([name, fontPath]) => {
      FONT_CACHE[name] = (await fs.readFile(fontPath)).toString('base64');
      FONT_TIMESTAMPS.set(name, Date.now());
    })
  );
};

const cleanupExpiredFonts = () => {
  const now = Date.now();
  for (const [key, timestamp] of FONT_TIMESTAMPS.entries()) {
    if (now - timestamp > FONT_CACHE_TTL) {
      delete FONT_CACHE[key];
      FONT_TIMESTAMPS.delete(key);
    }
  }
};

const initializeBrowserPool = async (): Promise<void> => {
  if (BROWSER_POOL.browser) return;

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images',
      '--disable-javascript'
    ],
    headless: true,
    timeout: CONFIG.BROWSER_TIMEOUT,
    defaultViewport: { width: CONFIG.CANVAS_WIDTH, height: 100 }
  });

  BROWSER_POOL.browser = browser;
  const pages = await Promise.all(
    Array(CONFIG.MAX_CONCURRENT_PAGES).fill(0).map(async () => {
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(CONFIG.PAGE_TIMEOUT);
      await page.setDefaultTimeout(CONFIG.PAGE_TIMEOUT);
      BROWSER_POOL.pageReuseCount.set(page, 0);
      return page;
    })
  );

  BROWSER_POOL.pages = pages;
  BROWSER_POOL.availablePages = [...pages];
  BROWSER_POOL.lastUsed = Date.now();
};

const getAvailablePage = async (): Promise<Page> => {
  if (!BROWSER_POOL.browser) await initializeBrowserPool();

  const checkPageHealth = async (page: Page): Promise<Page> => {
    const reuseCount = BROWSER_POOL.pageReuseCount.get(page) || 0;
    if (reuseCount >= BROWSER_POOL.MAX_PAGE_REUSE) {
      try {
        await page.close();
        const newPage = await BROWSER_POOL.browser!.newPage();
        await newPage.setDefaultNavigationTimeout(CONFIG.PAGE_TIMEOUT);
        await newPage.setDefaultTimeout(CONFIG.PAGE_TIMEOUT);
        BROWSER_POOL.pageReuseCount.set(newPage, 0);
        return newPage;
      } catch (error) {
        console.error('Failed to recreate page:', error);
        return page;
      }
    }
    return page;
  };

  const startTime = Date.now();
  while (BROWSER_POOL.availablePages.length === 0) {
    if (Date.now() - startTime > CONFIG.PAGE_TIMEOUT) {
      throw new Error('No available pages in pool');
    }
    await new Promise(res => setTimeout(res, 5));
  }

  let page = BROWSER_POOL.availablePages.pop()!;
  page = await checkPageHealth(page);

  BROWSER_POOL.inUse.add(page);
  BROWSER_POOL.lastUsed = Date.now();
  BROWSER_POOL.pageReuseCount.set(page, (BROWSER_POOL.pageReuseCount.get(page) || 0) + 1);
  return page;
};

const releasePage = (page: Page): void => {
  if (BROWSER_POOL.inUse.has(page)) {
    BROWSER_POOL.inUse.delete(page);
    BROWSER_POOL.availablePages.push(page);
  }
};

const emojiRegex = /<(a?):([^:]+):(\d+)>/g;
const processDiscordEmojis = (input: string): string => {
  const cached = emojiCache.get(input);
  if (cached) return cached;

  const result = input.replace(emojiRegex, (_, __, name, id) =>
    `<img src="https://cdn.discordapp.com/emojis/${id}.png?size=64" ` +
    `alt="${name}" style="height:${CONFIG.EMOJI_SIZE}px;vertical-align:middle;` +
    `margin:0 ${CONFIG.EMOJI_MARGIN}px;" crossorigin="anonymous" />`
  );
  emojiCache.set(input, result);
  return result;
};

const sanitizeHtml = (input: string): string =>
  input.replace(/[&<>"'\/]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }[c]!));

const processText = (input: string): string => {
  const processedEmojis = processDiscordEmojis(input);
  return processedEmojis.split(/(<img[^>]*>)/).map(part =>
    part.startsWith('<img') ? part : sanitizeHtml(part)
  ).join('');
};

const generateHtml = (text: string, width: number): string => {
  let template = htmlTemplateCache.get(width);

  if (!template) {
    cleanupExpiredFonts();
    template = `<!DOCTYPE html>
      <html><head><meta charset="UTF-8"><style>
      ${Object.entries(FONT_CACHE)
        .filter(([key]) => typeof FONT_CACHE[key] === 'string')
        .map(([name, data]) =>
          `@font-face {font-family:'${name}';src:url('data:font/ttf;base64,${data}');font-display:block;}`
        ).join('\n')}
      html,body{width:${width}px;background:white;font-family:'Emoji','Impact','Arial',sans-serif;}
      .container{margin:${CONFIG.PADDING / 2}px;background:white;text-align:center;}
      .text{font-size:${CONFIG.FONT_SIZE}px;color:black;line-height:1.2;word-wrap:break-word;}
      img{max-width:100%;height:auto;}
      </style></head><body>
      <div class="container"><div class="text">{{TEXT}}</div></div>
      </body></html>`;

    htmlTemplateCache.set(width, template);
  }

  return template.replace('{{TEXT}}', processText(text));
};

const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const generateImage = async (text: string, id: string): Promise<string> => {
  if (!text || text.length > 5000) throw new Error('Invalid text');

  const textsDir = './_temp/texts';
  const outputPath = path.join(textsDir, `${id}-text.png`) as `${string}.png`;
  let page: Page | null = null;

  try {
    await ensureDirectoryExists(textsDir);
    const html = generateHtml(text, CONFIG.CANVAS_WIDTH);
    page = await getAvailablePage();

    await Promise.all([
      page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.PAGE_TIMEOUT
      }),
      page.setViewport({
        width: CONFIG.CANVAS_WIDTH,
        height: 100,
        deviceScaleFactor: 1
      })
    ]);

    const container = await page.$('.container');
    if (!container) throw new Error('Missing container');

    const boundingBox = await container.boundingBox();
    if (!boundingBox) throw new Error('Missing bounding box');

    const finalHeight = Math.ceil(boundingBox.height) + CONFIG.PADDING;

    await page.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false,
      clip: {
        x: 0,
        y: 0,
        width: CONFIG.CANVAS_WIDTH,
        height: finalHeight
      }
    });

    return outputPath;
  } finally {
    if (page) releasePage(page);
  }
};

const cleanupBrowser = async (): Promise<void> => {
  if (BROWSER_POOL.browser && BROWSER_POOL.inUse.size === 0) {
    try {
      await Promise.all(BROWSER_POOL.pages.map(page => page.close().catch(() => {})));
      await BROWSER_POOL.browser.close();
    } catch (error) {
      console.error('Error during browser cleanup:', error);
    } finally {
      BROWSER_POOL.browser = null;
      BROWSER_POOL.pages = [];
      BROWSER_POOL.availablePages = [];
      BROWSER_POOL.inUse.clear();
      BROWSER_POOL.pageReuseCount.clear();
    }
  }
};

setInterval(async () => {
  const now = Date.now();
  if (BROWSER_POOL.browser) {
    if (
      BROWSER_POOL.inUse.size === 0 &&
      now - BROWSER_POOL.lastUsed > CONFIG.BROWSER_IDLE_TIMEOUT
    ) {
      await cleanupBrowser();
    } else if (now - BROWSER_POOL.lastUsed > CONFIG.BROWSER_IDLE_TIMEOUT * 2) {
      await cleanupBrowser();
    }
  }
  cleanupExpiredFonts();
}, 30000);

process.on('SIGINT', cleanupBrowser);
process.on('SIGTERM', cleanupBrowser);

const initializeOptimizations = async (): Promise<void> => {
  await preloadFonts();
  await initializeBrowserPool();
};

initializeOptimizations().catch(console.error);

export { generateImage, initializeOptimizations };
