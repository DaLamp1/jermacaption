<div align="center">
    <h1>Caption It Jerma!</h1>
    <img src="https://cdn.discordapp.com/attachments/747100248425365665/975018540371439676/jerma.gif" alt="when jerma discord bot reaction gif"/>
    
    <p><em>A Discord bot that generates custom Jerma GIFs with your text!</em></p>
    
    [![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
    [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
    [![Discord.js](https://img.shields.io/badge/Discord.js-13.17-purple.svg)](https://discord.js.org/)
</div>

<hr>

## 🎯 Features

- **Slash Commands**: Use `/jerma` to create custom GIFs
- **Context Menus**: Right-click any message to turn it into a GIF
- **Queue System**: Handles multiple requests efficiently with rate limiting
- **Custom GIFs**: Add your own GIF assets
- **Discord Emoji Support**: Renders custom Discord emojis properly
- **Autocomplete**: Easy GIF selection with search
- **Moderation**: Built-in user banning system

## 🚀 Quick Start

1. **Prerequisites**
   - Node.js 20.x or higher
   - FFmpeg installed
   - Discord bot application

2. **Installation**
   ```bash
   git clone <repository-url>
   cd jermacaption
   npm install
   ```

3. **Configuration**
   ```bash
   cp config/.env.example config/.env
   # Edit config/.env with your Discord bot credentials
   ```

4. **Run**
   ```bash
   npm run compile
   npm start
   ```

## 📖 Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete installation and configuration
- **[Usage Guide](docs/USAGE.md)** - How to use the bot commands and features
- **[Configuration](docs/CONFIGURATION.md)** - Advanced configuration options
- **[Development](docs/DEVELOPMENT.md)** - Contributing and development setup
- **[API Reference](docs/API.md)** - Technical API documentation

## 🎮 Usage

### Slash Command
```
/jerma text:When the impostor is sus
/jerma text:Chat is this real? gif:Audio Jungle
```

### Context Menu
Right-click on any message → "Turn into GIF"

## 🛠️ Tech Stack

- **Node.js & TypeScript** - Runtime and language
- **Discord.js** - Discord API integration
- **Puppeteer** - Text image generation
- **FFmpeg** - GIF processing and optimization
- **Canvas** - Image manipulation

## 📁 Project Structure

```
jermacaption/
├── src/                 # Source code
├── assets/             # GIF and font assets
├── config/             # Configuration files
├── docs/               # Documentation
└── _temp/              # Temporary files (auto-created)
```

## 🤝 Contributing

Community maintained project (rip jerma 01/07/2025).

See [Development Guide](docs/DEVELOPMENT.md) for contribution guidelines.

## 📜 License

MIT License - see the LICENSE file for details.

## 🙏 Credits

Original by Pauleks (epic): 
- [jermacaption](https://github.com/pauleks/jermacaption)

## 🐛 Issues & Support

If you encounter any issues:
1. Check the [documentation](docs/)
2. Search existing issues
3. Create a new issue with detailed information

---

<div align="center">
    <p><em>Made with ❤️ by the community</em></p>
</div>