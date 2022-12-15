import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { cleanExpiredStates, manageState } from './states.js';
import { cleanExpiredMessage } from './messages.js';

function initBot(): TelegramBot {
  dotenv.config();
  const token = process.env.TBOT_API_KEY;
  const bot = new TelegramBot(token, { polling: true });
  return bot;
}

async function main(): Promise<void> {
  const bot = initBot();

  setInterval(cleanExpiredStates, 3000);
  setInterval(() => cleanExpiredMessage(bot), 3000);

  bot.on('message', (msg) => {
    manageState(bot, msg);
  });
}

main();
