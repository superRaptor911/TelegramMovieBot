import TelegramBot from 'node-telegram-bot-api';
import { sendListOfMovies, sendListOfTorrents } from './messages.js';
import { searchMovies } from './movies.js';
import { writeUsageToSheet } from './sheets/googleSheet.js';
import {
  setUserState,
  STATE_USER_SEARCHING,
  STATE_USER_SELECTION_MODE,
  STATE_USER_IDLE,
  getUserState,
} from './states.js';

export async function handleMovieSearch(
  bot: TelegramBot,
  msg: TelegramBot.Message,
): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const username = msg.from.username;
  const message = msg.text;
  writeUsageToSheet(username, message);

  bot.sendMessage(chatId, 'Searching for movies...');
  try {
    const movieName = msg.text.replaceAll('/', '');
    if (movieName == 'start') {
      bot.sendMessage(
        chatId,
        "I'm ready to search for movies! enter to search for movies",
      );
      return;
    }
    console.log(`Searching for ${movieName}`);
    const movies = await searchMovies(movieName);

    setUserState(userId, STATE_USER_SEARCHING, movies.data.movies);
    await sendListOfMovies(bot, chatId, movies, userId);
    setUserState(
      userId,
      STATE_USER_SELECTION_MODE,
      movies.data.movies,
      STATE_USER_SEARCHING,
    );
  } catch (e) {
    /* handle error */
    console.error(`main::handleMovieSearch failed to get movies.`, e);
    bot.sendMessage(chatId, 'Failed to get movies');
    setUserState(userId, STATE_USER_IDLE, []);
  }
}

export async function handleMovieSelection(
  bot: TelegramBot,
  msg: TelegramBot.Message,
): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const input = msg.text.replaceAll('/', '');
    if (isNaN(+input)) {
      bot.sendMessage(chatId, 'Invalid input');
      bot.sendMessage(chatId, 'Please select a movie by typing the number');
      return;
    }

    const num = parseInt(input, 10);
    if (num === 0) {
      setUserState(userId, STATE_USER_IDLE, []);
      bot.sendMessage(chatId, 'Back to search');
      return;
    }

    const movies = getUserState(userId).data;
    if (num < 1 || num > movies.length) {
      bot.sendMessage(chatId, 'Invalid input');
      bot.sendMessage(chatId, 'Please select a movie by typing the number');
      return;
    }

    bot.sendMessage(chatId, 'Loading torrents...');
    const torrents = movies[num - 1].torrents;
    const movieName = movies[num - 1].title;
    await sendListOfTorrents(bot, chatId, torrents, movieName);
    setUserState(userId, STATE_USER_IDLE, []);
  } catch (e) {
    /* handle error */
    console.error('bot::handleMovieSelection failed to select movie.', e);
    bot.sendMessage(chatId, 'Something went wrong');
  }
}
