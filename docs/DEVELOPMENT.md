# Development Guide

## Project Structure

```
jermacaption/
├── src/                    # Source code
│   ├── index.ts           # Main entry point
│   ├── client.ts          # Discord bot client and queue management
│   ├── captions.ts        # Image generation with Puppeteer
│   ├── ffmpeg.ts          # GIF processing with FFmpeg
│   ├── files.ts           # File system utilities
│   ├── constants.ts       # Application constants
│   └── firstTimeSetup.ts  # Initial bot setup
├── assets/                # GIF and font assets
│   ├── fonts/            # Font files
│   └── *.gif             # GIF assets
├── config/               # Configuration files
│   ├── .env              # Environment variables
│   └── banned_users.txt  # Banned user list
├── _temp/                # Temporary files (auto-created)
│   ├── texts/           # Generated text images
│   └── *.gif            # Temporary GIF files
├── out/                  # Compiled JavaScript (auto-created)
└── docs/                 # Documentation
```

## Development Setup

### Prerequisites
- Node.js 20.x or higher
- TypeScript knowledge
- Discord.js familiarity
- FFmpeg installed

### Getting Started

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd jermacaption
   npm install
   ```

2. **Development environment**
   ```bash
   # Copy environment template
   cp config/.env.example config/.env
   
   # Edit with your Discord bot credentials
   nano config/.env
   ```

3. **Development server**
   ```bash
   npm run dev
   ```

## Architecture Overview

### Core Components

#### 1. Discord Client (`src/client.ts`)
- **Purpose**: Handles Discord interactions and queue management
- **Key Features**:
  - Slash command handling
  - Context menu interactions
  - Rate limiting and queue system
  - User ban management
  - Autocomplete for GIF selection

#### 2. Image Generation (`src/captions.ts`)
- **Purpose**: Creates text images using Puppeteer
- **Key Features**:
  - HTML/CSS text rendering
  - Discord emoji processing
  - Font loading and caching
  - Browser pool management
  - Automatic cleanup

#### 3. GIF Processing (`src/ffmpeg.ts`)
- **Purpose**: Combines text images with GIF assets
- **Key Features**:
  - FFmpeg integration
  - Palette optimization
  - File size management
  - Temporary file handling

#### 4. File Management (`src/files.ts`)
- **Purpose**: Asset and configuration file utilities
- **Key Features**:
  - GIF asset discovery
  - Random file selection
  - Banned user list management

### Data Flow

1. **User Input** → Discord interaction (slash command or context menu)
2. **Validation** → Rate limiting, ban checking, input sanitization
3. **Queue Management** → Add to queue or process immediately
4. **Text Generation** → Puppeteer creates text image
5. **GIF Composition** → FFmpeg combines text + GIF
6. **Response** → Send final GIF to Discord
7. **Cleanup** → Remove temporary files

## Key Technologies

### Discord.js v13
- **Interactions**: Slash commands and context menus
- **Autocomplete**: Dynamic GIF selection
- **File Uploads**: Sending generated GIFs

### Puppeteer
- **Headless Browser**: Chrome/Chromium automation
- **HTML Rendering**: CSS-styled text generation
- **Screenshot Capture**: Converting HTML to PNG

### FFmpeg
- **Video Processing**: GIF manipulation and optimization
- **Palette Generation**: Color optimization for smaller files
- **Composition**: Combining text and GIF layers

### TypeScript
- **Type Safety**: Comprehensive type definitions
- **Modern JavaScript**: ES2016+ features
- **Development Experience**: Better IDE support

## Development Patterns

### Error Handling
```typescript
try {
  await processGif(interaction, text, gif);
} catch (error) {
  consola.error(`Error processing gif for ${userId}:`, error);
  await interaction.editReply({ 
    content: ":sweat: Sorry! Something went wrong..." 
  });
}
```

### Resource Management
```typescript
// Browser pool pattern
const getBrowserPage = async (): Promise<Page> => {
  if (BROWSER_POOL.browser && !BROWSER_POOL.inUse) {
    BROWSER_POOL.inUse = true;
    return BROWSER_POOL.page;
  }
  // Create new browser instance
};

const releaseBrowserPage = (): void => {
  BROWSER_POOL.inUse = false;
  BROWSER_POOL.lastUsed = Date.now();
};
```

### Queue Management
```typescript
// Rate limiting with Map-based tracking
const isRateLimited = (userId: string): boolean => {
  const userTimes = userRequestTimes.get(userId) || [];
  const recentRequests = userTimes.filter(time => time > oneMinuteAgo);
  return recentRequests.length >= MAX_REQUESTS_PER_MINUTE;
};
```

## Testing

### Manual Testing
1. **Slash Commands**
   ```
   /jerma text:Test message
   /jerma text:Test with specific GIF gif:Bath
   ```

2. **Context Menus**
   - Right-click on messages
   - Select "Turn into GIF"

3. **Edge Cases**
   - Very long text (5000+ characters)
   - Empty messages
   - Special characters and emojis
   - Rate limiting (rapid requests)

### Performance Testing
- **Queue Stress Test**: Multiple simultaneous requests
- **Memory Usage**: Monitor browser instances
- **File Cleanup**: Verify temporary file removal

## Common Development Tasks

### Adding New Features

1. **New Discord Command**
   ```typescript
   // In src/firstTimeSetup.ts
   new SlashCommandBuilder()
     .setName('newcommand')
     .setDescription('Description')
     .addStringOption(option => ...)
   ```

2. **Modifying Image Generation**
   ```typescript
   // In src/captions.ts
   const CONFIG = {
     CANVAS_WIDTH: 800,  // Modify dimensions
     FONT_SIZE: 80,      // Adjust text size
     // ...
   };
   ```

3. **Queue Configuration**
   ```typescript
   // In src/client.ts
   const QUEUE_CONFIG = {
     MAX_QUEUE_SIZE: 100,              // Adjust limits
     MAX_USER_REQUESTS_PER_MINUTE: 3,  // Rate limiting
     // ...
   };
   ```

### Debugging

1. **Enable Verbose Logging**
   ```typescript
   // Add to src/index.ts
   consola.level = 4; // Debug level
   ```

2. **Browser Debugging**
   ```typescript
   // In src/captions.ts
   const browser = await puppeteer.launch({
     headless: false,  // Show browser
     devtools: true,   // Open DevTools
   });
   ```

3. **Queue State Inspection**
   ```typescript
   // Add logging in src/client.ts
   consola.info(`Queue state: ${gifQueue.length} items, ${processingCount} processing`);
   ```

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Use async/await over Promises

### Error Handling
- Always handle async operations
- Provide meaningful error messages
- Clean up resources in finally blocks
- Log errors with context

### Performance Considerations
- Reuse browser instances
- Clean up temporary files
- Implement proper rate limiting
- Monitor memory usage

### Security
- Sanitize user input
- Validate file paths
- Use environment variables for secrets
- Implement proper access controls

## Deployment

### Production Considerations
- Set `NODE_ENV=production`
- Use process managers (PM2, systemd)
- Monitor resource usage
- Implement log rotation
- Set up health checks

### Environment Variables
```env
NODE_ENV=production
DISCORD_APPLICATION_PUBLIC_KEY=...
DISCORD_APPLICATION_ID=...
DISCORD_APPLICATION_BOT_TOKEN=...
```

### System Requirements
- **CPU**: Multi-core recommended for concurrent processing
- **RAM**: 2GB+ for browser instances and image processing
- **Storage**: SSD recommended for temporary file operations
- **Network**: Stable connection for Discord API