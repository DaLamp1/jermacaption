# Usage Guide

## Commands

### Slash Command: `/jerma`

Create a custom Jerma GIF with your text.

**Parameters:**
- `text` (required): The text to display above the GIF (max 5000 characters)
- `gif` (optional): Choose a specific GIF from available options (autocomplete enabled)

**Examples:**
```
/jerma text:When the impostor is sus
/jerma text:Chat is this real? gif:Audio Jungle
```

### Context Menu: "Turn into GIF"

Right-click on any message and select "Turn into GIF" to convert the message text into a Jerma caption.

**Requirements:**
- The message must contain text
- Text length must be under 5000 characters

## Features

### Queue System

The bot includes a sophisticated queue system to handle multiple requests:

- **Rate Limiting**: Users can make up to 3 requests per minute
- **Queue Management**: Up to 100 requests can be queued
- **Concurrent Processing**: Up to 5 GIFs can be processed simultaneously
- **User Limits**: Each user can have maximum 2 requests in queue at once

### GIF Selection

- **Random Selection**: If no GIF is specified, a random one is chosen
- **Autocomplete**: Type part of a GIF name to see matching options
- **Custom Assets**: Add your own GIFs to the `assets/` folder

### Text Processing

The bot supports:
- **Unicode Characters**: Full Unicode support including emojis
- **Discord Emojis**: Custom Discord emojis are rendered properly
- **Long Text**: Automatic text wrapping and sizing
- **Special Characters**: Safe handling of HTML entities

## Queue Status Messages

When the bot is busy, you'll see status messages:

- `🔄 Processing your request...` - Your GIF is being generated
- `⏳ Your request is in the queue! Position: X/Y` - Waiting in line
- `⚠️ The queue is currently full. Please try again later.` - Queue at capacity
- `⚠️ You have too many requests in the queue.` - User limit reached
- `⚠️ You're sending requests too quickly!` - Rate limit hit

## Tips for Best Results

### Text Guidelines
- Keep text concise for better readability
- Use line breaks for longer messages
- Avoid excessive special characters
- Consider the GIF's aspect ratio when writing text

### Performance Tips
- Popular GIFs may have longer queue times
- Try different GIFs if one is heavily used
- Shorter text processes faster
- Use the autocomplete feature to find GIFs quickly

### Troubleshooting
- If a request fails, try again with shorter text
- Check that your message contains actual text (not just emojis)
- Wait a moment between requests to avoid rate limiting
- Contact server admins if the bot appears unresponsive

## Error Messages

Common error messages and their meanings:

- `❌ The message must have text.` - Context menu used on empty message
- `😅 Sorry! Something went wrong...` - Internal processing error
- `⚠️ Text is too long` - Message exceeds 5000 character limit
- `⚠️ Text cannot be empty` - No text provided

## Advanced Usage

### Custom GIFs
Server administrators can add custom GIFs by:
1. Adding `.gif` files to the `assets/` directory
2. Restarting the bot
3. New GIFs will appear in autocomplete

### Moderation
Administrators can ban users by:
1. Adding user IDs to `config/banned_users.txt`
2. One ID per line
3. Comments can be added after the ID
4. Changes take effect within 5 minutes