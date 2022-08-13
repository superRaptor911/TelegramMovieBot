import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import {
  getUserState,
  handleMovieSearch,
  handleMovieSelection,
  STATE_USER_IDLE,
  STATE_USER_SEARCHING,
} from './bot.js';

function initBot(): TelegramBot {
  dotenv.config();
  const token = process.env.TBOT_API_KEY;
  const bot = new TelegramBot(token, { polling: true });
  return bot;
}

async function main(): Promise<void> {
  const bot = initBot();
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userState = getUserState(userId);

    if (userState.staus === STATE_USER_IDLE) handleMovieSearch(bot, msg);
    else if (userState.staus === STATE_USER_SEARCHING)
      handleMovieSelection(bot, msg);
    else bot.sendMessage(chatId, 'An error occured');
  });
}

main();
