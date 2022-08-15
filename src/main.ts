import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { manageState } from './states.js';

function initBot(): TelegramBot {
  dotenv.config();
  const token = process.env.TBOT_API_KEY;
  const bot = new TelegramBot(token, { polling: true });
  return bot;
}

async function main(): Promise<void> {
  const bot = initBot();
  bot.on('message', (msg) => {
    manageState(bot, msg);
  });
}

main();
