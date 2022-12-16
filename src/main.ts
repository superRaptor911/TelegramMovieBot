import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { cleanExpiredStates } from './states.js';
import { cleanExpiredMessage } from './messages.js';
import { handleMovieSearch, handleMovieSelection } from './bot.js';

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
    handleMovieSearch(bot, msg);
  });

  bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const selection = callbackQuery.data;
    handleMovieSelection(bot, msg, selection);
  });
}

main();
