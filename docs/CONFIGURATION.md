# Configuration Guide

## Environment Variables

All configuration is done through the `config/.env` file:

```env
# Discord Bot Configuration
DISCORD_APPLICATION_PUBLIC_KEY=your_public_key_here
DISCORD_APPLICATION_ID=your_application_id_here
DISCORD_APPLICATION_BOT_TOKEN=your_bot_token_here
```

### Required Variables

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `DISCORD_APPLICATION_PUBLIC_KEY` | Your Discord app's public key | Discord Developer Portal > General Information |
| `DISCORD_APPLICATION_ID` | Your Discord application ID | Discord Developer Portal > General Information |
| `DISCORD_APPLICATION_BOT_TOKEN` | Your Discord bot token | Discord Developer Portal > Bot |

## Configuration Files

### `config/banned_users.txt`

Manage banned users who cannot use the bot.

**Format:**
```
# Comments start with #
# One user ID per line
123456789012345678 Reason for ban (optional)
987654321098765432 Another banned user
```

**Features:**
- Automatic reload every 5 minutes
- Comments supported with `#`
- Reason tracking (optional)

### `config/version.txt`

Tracks configuration version for setup management.
- Created automatically during first run
- Delete to trigger setup wizard again

## Bot Configuration

### Queue Settings

Located in `src/client.ts`, these settings control request handling:

```typescript
const QUEUE_CONFIG = {
  MAX_QUEUE_SIZE: 100,                    // Maximum requests in queue
  MAX_USER_REQUESTS_PER_MINUTE: 3,        // Rate limit per user
  MAX_PROCESSING_TIME_MS: 30000,          // 30 second timeout
  CLEANUP_INTERVAL_MS: 60000,             // 1 minute cleanup cycle
  MAX_CONCURRENT_PROCESSING: 5,           // Simultaneous processing limit
};
```

### Image Generation Settings

Located in `src/captions.ts`, these control image appearance:

```typescript
const CONFIG = {
  CANVAS_WIDTH: 800,           // Image width in pixels
  FONT_SIZE: 80,              // Text font size
  PADDING: 20,                // Image padding
  BROWSER_TIMEOUT: 30000,     // Browser launch timeout
  PAGE_TIMEOUT: 15000,        // Page load timeout
  BROWSER_IDLE_TIMEOUT: 300000, // 5 minute browser cleanup
  EMOJI_SIZE: 60,             // Discord emoji size
  EMOJI_MARGIN: 3             // Emoji spacing
};
```

### Font Configuration

Font files are loaded from `assets/fonts/`:

```typescript
const FONT_PATHS = {
  impact: './assets/fonts/Impact.ttf',
  arial: './assets/fonts/Arial.ttf',
  emoji: './assets/fonts/Emoji.ttf'
};
```

## Asset Management

### GIF Assets

- **Location**: `assets/` directory
- **Format**: `.gif` files only
- **Naming**: Filename becomes the command option name
- **Size**: Recommended 700px width for optimal performance

### Font Assets

- **Location**: `assets/fonts/` directory
- **Required Fonts**:
  - `Impact.ttf` - Main text font
  - `Arial.ttf` - Fallback font
  - `Emoji.ttf` - Emoji support

## Performance Tuning

### Memory Management

The bot includes automatic cleanup:
- Browser instances are reused and cleaned up after 5 minutes of inactivity
- Temporary files are automatically deleted after processing
- Font files are cached in memory for performance

### Processing Optimization

- **Concurrent Limits**: Adjust `MAX_CONCURRENT_PROCESSING` based on server capacity
- **Queue Size**: Increase `MAX_QUEUE_SIZE` for high-traffic servers
- **Timeouts**: Adjust timeout values based on server performance

### Rate Limiting

Customize rate limiting in `QUEUE_CONFIG`:
- `MAX_USER_REQUESTS_PER_MINUTE`: Prevent spam
- User request tracking with automatic cleanup
- Per-user queue limits to prevent monopolization

## Security Considerations

### Token Security
- Never commit `.env` files to version control
- Rotate bot tokens if compromised
- Use environment variables in production

### User Input Sanitization
- HTML entities are automatically escaped
- Input length limits enforced
- Profanity filtering available (leo-profanity package)

### File System Security
- Temporary files use unique identifiers
- Automatic cleanup prevents disk space issues
- Font loading uses base64 encoding for security

## Monitoring and Logging

### Console Logging
The bot uses `consola` for structured logging:
- Info: General operation messages
- Success: Successful operations
- Error: Error conditions
- Warn: Warning conditions

### Queue Monitoring
Track queue performance:
- Queue size logging
- Processing time tracking
- User request patterns
- Error rate monitoring

## Troubleshooting Configuration

### Common Issues

1. **Bot not responding**
   - Check token validity
   - Verify bot permissions
   - Check console for errors

2. **Commands not appearing**
   - Ensure bot has `applications.commands` scope
   - Re-run setup if needed
   - Check Discord API status

3. **Image generation failing**
   - Verify FFmpeg installation
   - Check font file availability
   - Monitor memory usage

4. **Queue issues**
   - Adjust concurrent processing limits
   - Check timeout settings
   - Monitor server resources

### Debug Mode

Enable detailed logging by modifying the consola configuration in `src/index.ts`.