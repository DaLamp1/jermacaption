# Development Guide

Welcome to the development guide for **Caption It Jerma**! This guide will help you understand the codebase, add new features, test your changes, and optimize performance.

---

## Code Structure & Architecture

The project is organized for clarity and maintainability:

- **src/** — Main source code
  - `index.ts` — Entry point
  - `client.ts` — Discord client and event handling
  - `captions.ts` — Caption rendering logic
  - `ffmpeg.ts` — FFmpeg integration for GIF processing
  - `files.ts` — File management utilities
  - `constants.ts` — Shared constants
  - `firstTimeSetup.ts` — Automated setup logic
- **assets/** — GIFs and fonts for captioning
- **config/** — Configuration files and environment variables
- **docs/** — Project documentation

> The bot uses a modular TypeScript structure. Each major feature is separated into its own file for easier maintenance and scalability.

---

## Adding New Features

1. **Plan your feature:** Outline what you want to add or change.
2. **Create or update files in `src/`:** Add new modules or extend existing ones.
3. **Follow code style:** Use TypeScript, async/await, and clear, descriptive function names.
4. **Test locally:** Run the bot and verify your feature works as expected.
5. **Document your changes:** Update the README or add code comments as needed.
6. **Submit a pull request:** Clearly describe your changes and reference any related issues.

---

## Testing & Debugging

- Run `npm run compile` to check for TypeScript errors.
- Start the bot with `npm start` and test commands in a private Discord server.
- Use console logs or a debugger for troubleshooting.
- Write unit tests for critical logic (if applicable).
- Simulate multiple requests to test queue and rate limiting.

---

## Performance Optimization

- **Efficient GIF Processing:** Use FFmpeg options that minimize processing time without sacrificing quality.
- **Queue Management:** Tune queue limits in the config to prevent overload.
- **Resource Usage:** Monitor memory and CPU usage, especially when adding new GIFs or features.
- **Code Review:** Refactor and remove unused code regularly.

---

For more details, see the other docs in this folder or open an issue for help!
