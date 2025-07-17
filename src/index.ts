import { consola } from "consola";
import { checkSetup, checkToken } from "./firstTimeSetup";

import { REST } from "@discordjs/rest";
import { API } from "@discordjs/core";

import { config } from "dotenv";
config({ path: "./config/.env" });

import { launchBot } from "./client";

consola.box(`Launching Caption It Jerma!
⠉⠉⠉⣿⡿⠿⠛⠋⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⣻⣩⣉⠉⠉
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⣀⣀⣀⣀⣀⣀⡀⠄⠄⠉⠉⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣠⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠄⠄⢤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠄⠄⠄
⡄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⠄⠉⠉⠉⣋⠉⠉⠉⠉⠉⠉⠉⠉⠙⠛⢷⡀⠄⠄
⣿⡄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠠⣾⣿⣷⣄⣀⣀⣀⣠⣄⣢⣤⣤⣾⣿⡀⠄
⣿⠃⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣹⣿⣿⡿⠿⣿⣿⣿⣿⣿⣿⣿⣿⢟⢁⣠
⣿⣿⣄⣀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⠉⣉⣉⣰⣿⣿⣿⣿⣿⣷⣥⡀⠉⢁⡥⠈
⣿⣿⣿⢹⣇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠒⠛⠛⠋⠉⠉⠛⢻⣿⣿⣷⢀⡭⣤⠄
⣿⣿⣿⡼⣿⠷⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⣀⣠⣿⣟⢷⢾⣊⠄⠄
⠉⠉⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⣈⣉⣭⣽⡿⠟⢉⢴⣿⡇⣺⣿⣷
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠁⠐⢊⣡⣴⣾⣥⣿⣿⣿`);

consola.warn("Very experimental release, more updates to come.");

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_APPLICATION_BOT_TOKEN as string
);
const api = new API(rest);

// Main startup function
const startBot = async () => {
  try {
    consola.info("Starting bot initialization...");
    
    // Check token first
    await checkToken(api);
    consola.success("Token validation successful!");
    
    // Check setup
    await checkSetup(api);
    consola.success("Setup validation successful!");
    
    // Launch bot
    await launchBot();
    
  } catch (error) {
    consola.error("Bot initialization failed:", error);
    consola.info("Boot process failed. The bot will now shut down.");
    process.exitCode = 1;
  }
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  consola.error('Uncaught Exception:', error);
  process.exitCode = 1;
});

process.on('unhandledRejection', (reason, promise) => {
  consola.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exitCode = 1;
});

// Graceful shutdown
process.on('SIGINT', () => {
  consola.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  consola.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the bot
startBot();