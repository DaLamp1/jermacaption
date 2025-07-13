# Caption It Jerma - Community Maintained

A Discord bot that generates custom GIFs by overlaying text on Jerma985 reaction GIFs.

## Project Status

**This is a community-maintained fork.** The original creator (pauleks) has abandoned the project, and this version is maintained by the community to keep it functional and improve its features.

## What It Does

Transform any text into a Jerma985 GIF:
- **Slash Commands**: `/jerma text:When the impostor is sus`
- **Context Menus**: Right-click any message → "Turn into GIF"
- **Custom GIFs**: Add your own Jerma GIFs to expand the collection
- **Smart Queuing**: Handles multiple requests with rate limiting and queue management

## Features

- 🎭 **Multiple GIF Options**: Choose from dozens of Jerma reaction GIFs
- 🔄 **Queue System**: Processes up to 100 requests with intelligent rate limiting
- 📝 **Rich Text Support**: Unicode, emojis, and Discord custom emojis
- 🛠️ **Easy Setup**: Automated first-time configuration
- 🔧 **Customizable**: Add your own GIFs and configure performance settings
- 🔐 **Moderation**: Built-in user banning and rate limiting

## Quick Start

1. **Install Prerequisites**
   ```bash
   # Install Node.js 20+ and FFmpeg
   sudo apt install nodejs npm ffmpeg  # Ubuntu/Debian
   brew install node ffmpeg            # macOS
   ```

2. **Setup Bot**
   ```bash
   git clone <https://github.com/MucciDev/jermacaption>
   cd jermacaption
   npm install
   ```

3. **Configure Discord**
   - Create a Discord application at https://discord.com/developers/applications
   - Create a bot and copy the token
   - Configure environment variables in `config/.env`

4. **Run**
   ```bash
   npm run compile
   npm start
   ```

## Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete installation and configuration
- **[Usage Guide](docs/USAGE.md)** - How to use the bot commands
- **[Configuration](docs/CONFIGURATION.md)** - Customize settings and manage users
- **[Development](docs/DEVELOPMENT.md)** - Code structure and contribution guide
- **[API Reference](docs/API.md)** - Function documentation for developers

## Contributing

Since this is community-maintained, contributions are welcome! See the [Development Guide](docs/DEVELOPMENT.md) for:
- Code structure and architecture
- Adding new features
- Testing and debugging
- Performance optimization

## Requirements

- Node.js 20.x or higher
- FFmpeg for GIF processing
- Discord bot token and application ID

## License

This is a community fork of the original project by pauleks. Please respect the original creator's work while contributing to this maintained version.
