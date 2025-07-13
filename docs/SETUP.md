# Setup Guide

## Prerequisites

Before setting up Caption It Jerma, ensure you have:

- **Node.js 20.x** or higher
- **FFmpeg** installed on your system
- A **Discord Application** with bot permissions

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jermacaption
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install FFmpeg**
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt update
   sudo apt install ffmpeg
   ```
   
   **macOS (with Homebrew):**
   ```bash
   brew install ffmpeg
   ```
   
   **Windows:**
   - Download from [FFmpeg official website](https://ffmpeg.org/download.html)
   - Add to your system PATH

## Discord Bot Setup

1. **Create a Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Give it a name (e.g., "Caption It Jerma")

2. **Create a Bot**
   - Go to the "Bot" section
   - Click "Add Bot"
   - Copy the bot token (keep this secret!)

3. **Get Application Details**
   - Go to "General Information"
   - Copy the "Application ID"
   - Copy the "Public Key"

4. **Set Bot Permissions**
   - Go to "Bot" section
   - Under "Privileged Gateway Intents", enable:
     - Message Content Intent
   - Under "Bot Permissions", select:
     - Send Messages
     - Use Slash Commands
     - Attach Files

## Configuration

1. **Create environment file**
   ```bash
   cp config/.env.example config/.env
   ```

2. **Edit the `.env` file**
   ```env
   DISCORD_APPLICATION_PUBLIC_KEY=your_public_key_here
   DISCORD_APPLICATION_ID=your_application_id_here
   DISCORD_APPLICATION_BOT_TOKEN=your_bot_token_here
   ```

3. **Add GIF assets**
   - Place your GIF files in the `assets/` directory
   - Supported format: `.gif`
   - Recommended size: 700px width or smaller for optimal performance

## First Run

1. **Compile TypeScript**
   ```bash
   npm run compile
   ```

2. **Start the bot**
   ```bash
   npm start
   ```

3. **Follow the setup wizard**
   - The bot will guide you through first-time setup
   - It will register Discord slash commands automatically
   - Configuration files will be created

## Invite Bot to Server

1. **Generate invite link**
   - Go to Discord Developer Portal > Your App > OAuth2 > URL Generator
   - Select scopes: `bot` and `applications.commands`
   - Select permissions: `Send Messages`, `Use Slash Commands`, `Attach Files`
   - Copy the generated URL

2. **Add to server**
   - Open the invite URL
   - Select your server
   - Authorize the bot

## Verification

Test the bot by using the `/jerma` command in your Discord server:
```
/jerma text:Hello World!
```

The bot should respond with a GIF of Jerma with your text above it.