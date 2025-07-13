# API Reference

## Core Functions

### Image Generation (`src/captions.ts`)

#### `generateImage(text: string, id: string): Promise<string>`

Generates a PNG image with the specified text using Puppeteer.

**Parameters:**
- `text` (string): The text to render (max 5000 characters)
- `id` (string): Unique identifier for the generated file

**Returns:**
- `Promise<string>`: Path to the generated PNG file

**Throws:**
- `Error`: If text is empty, too long, or generation fails

**Example:**
```typescript
const imagePath = await generateImage("Hello World!", "user123-interaction456");
```

---

### GIF Processing (`src/ffmpeg.ts`)

#### `generateGIF(gif: string, identifier: string): Promise<Buffer>`

Combines a text image with a GIF asset using FFmpeg.

**Parameters:**
- `gif` (string): Name of the GIF file (without extension)
- `identifier` (string): Unique identifier matching the text image

**Returns:**
- `Promise<Buffer>`: The generated GIF as a Buffer

**Throws:**
- `Error`: If FFmpeg processing fails or files are missing

**Example:**
```typescript
const gifBuffer = await generateGIF("Bath", "user123-interaction456");
```

---

### File Utilities (`src/files.ts`)

#### `getGIFNames(): string[]`

Retrieves all available GIF names from the assets directory.

**Returns:**
- `string[]`: Array of GIF names (without file extensions)

**Example:**
```typescript
const availableGifs = getGIFNames();
// Returns: ["Bath", "Audio Jungle", "Boo Hoo", "Breakcore"]
```

#### `getRandomFile(allFiles: string[]): string`

Selects a random file from the provided array using cryptographically secure randomness.

**Parameters:**
- `allFiles` (string[]): Array of file names to choose from

**Returns:**
- `string`: Randomly selected file name

**Example:**
```typescript
const randomGif = getRandomFile(getGIFNames());
```

#### `getBannedUsers(): string[]`

Reads and parses the banned users configuration file.

**Returns:**
- `string[]`: Array of banned user IDs

**Example:**
```typescript
const bannedUsers = getBannedUsers();
```

---

## Discord Integration (`src/client.ts`)

### Queue Management

#### Queue Configuration
```typescript
const QUEUE_CONFIG = {
  MAX_QUEUE_SIZE: 100,                    // Maximum requests in queue
  MAX_USER_REQUESTS_PER_MINUTE: 3,        // Rate limit per user
  MAX_PROCESSING_TIME_MS: 30000,          // Processing timeout (30s)
  CLEANUP_INTERVAL_MS: 60000,             // Cleanup interval (1m)
  MAX_CONCURRENT_PROCESSING: 5,           // Concurrent processing limit
};
```

#### Rate Limiting Functions

##### `isRateLimited(userId: string): boolean`

Checks if a user has exceeded the rate limit.

**Parameters:**
- `userId` (string): Discord user ID

**Returns:**
- `boolean`: True if user is rate limited

##### `recordRequest(userId: string): void`

Records a new request timestamp for rate limiting.

**Parameters:**
- `userId` (string): Discord user ID

##### `getQueuePosition(userId: string): number`

Gets the position of a user's request in the queue.

**Parameters:**
- `userId` (string): Discord user ID

**Returns:**
- `number`: Queue position (1-indexed, 0 if not found)

---

## Configuration (`src/constants.ts`)

### Constants Object
```typescript
const Constants = {
  CONFIG_BANNED_USERS_FILE_INTRO: string,  // Banned users file header
  CONFIG_CURRENT_CONFIG_VERSION: string,   // Current config version
  BANNED_USER_MESSAGE: string              // Message shown to banned users
};
```

---

## Setup Functions (`src/firstTimeSetup.ts`)

### `checkToken(DISCORD_API: API): Promise<void>`

Validates Discord bot credentials and displays bot information.

**Parameters:**
- `DISCORD_API` (API): Discord API instance

**Throws:**
- `Error`: If credentials are invalid or missing

### `checkSetup(DISCORD_API: API): Promise<void>`

Performs first-time setup if needed, including command registration.

**Parameters:**
- `DISCORD_API` (API): Discord API instance

---

## Type Definitions

### Queue Item
```typescript
type QueueItem = {
  interaction: CommandInteraction | MessageContextMenuInteraction;
  text: string;
  gif: string;
  userId: string;
  timestamp: number;
};
```

### Font Cache
```typescript
interface FontCache {
  [key: string]: Promise<string>;
}
```

### Browser Pool
```typescript
interface BrowserPool {
  browser: Browser | null;
  page: Page | null;
  inUse: boolean;
  lastUsed: number;
}
```

---

## Error Handling

### Common Error Types

#### Image Generation Errors
- **Empty Text**: `"Text cannot be empty"`
- **Text Too Long**: `"Text is too long"`
- **Generation Failure**: `"Failed to generate image: {reason}"`

#### Queue Errors
- **Queue Full**: `"The queue is currently full"`
- **User Limit**: `"You have too many requests in the queue"`
- **Rate Limited**: `"You're sending requests too quickly"`

#### Processing Errors
- **Timeout**: `"Processing timeout for user {userId}"`
- **FFmpeg Failure**: FFmpeg command execution errors
- **File Not Found**: Missing GIF or font assets

---

## Performance Considerations

### Memory Management
- Browser instances are pooled and reused
- Automatic cleanup after 5 minutes of inactivity
- Font files are cached in memory as base64

### File System
- Temporary files use unique identifiers
- Automatic cleanup after processing
- Separate directories for different file types

### Concurrency
- Maximum 5 concurrent processing operations
- Queue system prevents resource exhaustion
- Rate limiting prevents abuse

---

## Security Features

### Input Sanitization
```typescript
const sanitizeInput = (input: string | undefined): string => {
  if (!input) return "";
  return input.replace(/[^a-zA-Z0-9_\- ]/g, "");
};
```

### HTML Entity Escaping
```typescript
const sanitizeHtml = (input: string): string => {
  const charactersMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
  };
  return input.replace(/[&<>"'\/]/g, (char) => charactersMap[char]);
};
```

### User Validation
- Banned user checking
- Rate limiting enforcement
- Input length validation
- File path validation

---

## Environment Variables

### Required Variables
```typescript
process.env.DISCORD_APPLICATION_PUBLIC_KEY  // Discord app public key
process.env.DISCORD_APPLICATION_ID          // Discord application ID
process.env.DISCORD_APPLICATION_BOT_TOKEN   // Discord bot token
```

### Usage Example
```typescript
import { config } from "dotenv";
config({ path: "./config/.env" });

const client = new Client({
  intents: ["GUILD_MESSAGES", "MESSAGE_CONTENT"],
});

client.login(process.env.DISCORD_APPLICATION_BOT_TOKEN);
```