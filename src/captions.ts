import { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

interface FontCache {
  [key: string]: string; // Changed from Promise<string> to string
}

interface BrowserPool {
  browser: Browser | null;
  pages: Page[];
  availablePages: Page[];
  inUse: Set<Page>;
  lastUsed: number;
}

const FONT_CACHE: FontCache = {};
const BROWSER_POOL: BrowserPool = {
  browser: null,
  pages: [],
  availablePages: [],
  inUse: new Set(),
  lastUsed: 0
};

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
  PRELOAD_PAGES: 3
};

const FONT_PATHS = {
  impact: './assets/fonts/Impact.ttf',
  arial: './assets/fonts/Arial.ttf',
  emoji: './assets/fonts/Emoji.ttf'
};

// Pre-load all fonts
const preloadFonts = async (): Promise<void> => {
  const fontPromises = Object.entries(FONT_PATHS).map(async ([name, path]) => {
    try {
      const buffer = await fs.readFile(path);
      FONT_CACHE[name] = buffer.toString('base64');
    } catch (error) {
      throw new Error(`Failed to preload font ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  await Promise.all(fontPromises);
};

// Initialize browser pool
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
    defaultViewport: {
      width: CONFIG.CANVAS_WIDTH,
      height: 100
    }
  });

  BROWSER_POOL.browser = browser;
  
  // Create multiple pages
  const pagePromises = Array(CONFIG.MAX_CONCURRENT_PAGES).fill(null).map(async () => {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(CONFIG.PAGE_TIMEOUT);
    await page.setDefaultTimeout(CONFIG.PAGE_TIMEOUT);
    return page;
  });
  
  const pages = await Promise.all(pagePromises);
  BROWSER_POOL.pages = pages;
  BROWSER_POOL.availablePages = [...pages];
  BROWSER_POOL.lastUsed = Date.now();
};

const getAvailablePage = async (): Promise<Page> => {
  if (!BROWSER_POOL.browser) {
    await initializeBrowserPool();
  }
  
  // Wait for available page with timeout
  const startTime = Date.now();
  while (BROWSER_POOL.availablePages.length === 0) {
    if (Date.now() - startTime > 5000) { // 5 second timeout
      throw new Error('No available pages in pool');
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  const page = BROWSER_POOL.availablePages.pop()!;
  BROWSER_POOL.inUse.add(page);
  BROWSER_POOL.lastUsed = Date.now();
  
  return page;
};

const releasePage = (page: Page): void => {
  if (BROWSER_POOL.inUse.has(page)) {
    BROWSER_POOL.inUse.delete(page);
    BROWSER_POOL.availablePages.push(page);
  }
};

// Optimized emoji processing with caching
const emojiCache = new Map<string, string>();

const processDiscordEmojis = (input: string): string => {
  if (emojiCache.has(input)) {
    return emojiCache.get(input)!;
  }
  
  const emojiRegex = /<(a?):([^:]+):(\d+)>/g;
  const result = input.replace(emojiRegex, (match, animated, name, id) => {
    const emojiUrl = `https://cdn.discordapp.com/emojis/${id}.png?size=64`;
    return `<img src="${emojiUrl}" alt="${name}" style="height:${CONFIG.EMOJI_SIZE}px;vertical-align:middle;margin:0 ${CONFIG.EMOJI_MARGIN}px;" crossorigin="anonymous" />`;
  });
  
  emojiCache.set(input, result);
  return result;
};

// Optimized HTML sanitization
const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#x2F;");
};

const processText = (input: string): string => {
  const processedEmojis = processDiscordEmojis(input);
  const parts = processedEmojis.split(/(<img[^>]*>)/);
  
  return parts.map(part => {
    if (part.startsWith('<img')) {
      return part;
    }
    return sanitizeHtml(part);
  }).join('');
};

// Pre-built HTML
const HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Impact';
      src: url('data:font/ttf;base64,{{IMPACT_FONT}}');
      font-display: block;
    }
    @font-face {
      font-family: 'Arial';
      src: url('data:font/ttf;base64,{{ARIAL_FONT}}');
      font-display: block;
    }
    @font-face {
      font-family: 'Emoji';
      src: url('data:font/ttf;base64,{{EMOJI_FONT}}');
      font-display: block;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: {{WIDTH}}px;
      background-color: white;
      font-family: 'Emoji', 'Impact', 'Arial', sans-serif;
    }
    
    .container {
      margin: {{PADDING}}px;
      background-color: white;
      text-align: center;
    }
    
    .text {
      font-size: {{FONT_SIZE}}px;
      font-weight: normal;
      color: black;
      line-height: 1.2;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }
    
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="text">{{TEXT}}</div>
  </div>
</body>
</html>`;

// Cached HTML template
let cachedHtmlTemplate: string | null = null;

const generateHtml = (text: string, width: number): string => {
  if (!cachedHtmlTemplate) {
    cachedHtmlTemplate = HTML_TEMPLATE
      .replace('{{IMPACT_FONT}}', FONT_CACHE.impact)
      .replace('{{ARIAL_FONT}}', FONT_CACHE.arial)
      .replace('{{EMOJI_FONT}}', FONT_CACHE.emoji)
      .replace('{{WIDTH}}', width.toString())
      .replace('{{PADDING}}', (CONFIG.PADDING / 2).toString())
      .replace('{{FONT_SIZE}}', CONFIG.FONT_SIZE.toString());
  }
  
  const processedText = processText(text);
  return cachedHtmlTemplate.replace('{{TEXT}}', processedText);
};

const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Optimized image generation with page pooling
const generateImage = async (text: string, id: string): Promise<string> => {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  if (text.length > 5000) {
    throw new Error('Text is too long');
  }

  const textsDir = './_temp/texts';
  const outputPath = path.join(textsDir, `${id}-text.png`);
  let page: Page | null = null;

  try {
    await ensureDirectoryExists(textsDir);
    
    const html = generateHtml(text, CONFIG.CANVAS_WIDTH);
    page = await getAvailablePage();

    // Set content with minimal waiting
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded', // Removed networkidle0
      timeout: CONFIG.PAGE_TIMEOUT
    });

    // Get container and calculate height
    const container = await page.$('.container');
    if (!container) {
      throw new Error('Could not find container element');
    }

    const boundingBox = await container.boundingBox();
    if (!boundingBox) {
      throw new Error('Could not get container bounding box');
    }

    const finalHeight = Math.ceil(boundingBox.height) + CONFIG.PADDING;
    
    // Take screenshot
    await page.screenshot({
      path: outputPath as `${string}.png`,
      type: 'png',
      omitBackground: false,
      clip: {
        x: 0,
        y: 0,
        width: CONFIG.CANVAS_WIDTH,
        height: finalHeight
      },
      optimizeForSpeed: true // Puppeteer optimization
    });

    return outputPath;
  } catch (error) {
    console.error(`Error generating image for ${id}:`, error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (page) {
      releasePage(page);
    }
  }
};

const cleanupBrowser = async (): Promise<void> => {
  if (BROWSER_POOL.browser && BROWSER_POOL.inUse.size === 0) {
    try {
      await BROWSER_POOL.browser.close();
    } catch (error) {
      console.warn('Error closing browser during cleanup:', error);
    } finally {
      BROWSER_POOL.browser = null;
      BROWSER_POOL.pages = [];
      BROWSER_POOL.availablePages = [];
      BROWSER_POOL.inUse.clear();
    }
  }
};

// Cleanup
setInterval(async () => {
  const now = Date.now();
  if (BROWSER_POOL.browser && 
      BROWSER_POOL.inUse.size === 0 && 
      now - BROWSER_POOL.lastUsed > CONFIG.BROWSER_IDLE_TIMEOUT) {
    await cleanupBrowser();
  }
}, 60000);

process.on('SIGINT', cleanupBrowser);
process.on('SIGTERM', cleanupBrowser);

// Initialize everything at startup
const initializeOptimizations = async (): Promise<void> => {
  await preloadFonts();
  await initializeBrowserPool();
};

// Call this in main startup
initializeOptimizations().catch(console.error);

export { generateImage, initializeOptimizations };