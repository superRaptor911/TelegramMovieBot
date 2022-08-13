import TelegramBot from 'node-telegram-bot-api';
import { sendListOfMovies, sendListOfTorrents } from './messages.js';
import { searchMovies } from './movies.js';
import { Movie } from './types/movies.js';

export const STATE_USER_IDLE = 0;
export const STATE_USER_SEARCHING = 1;

interface UserState {
  staus: number;
  timestamp: number;
  data: Movie[];
}

const State: { [key: number]: UserState } = {};

function setUserState(userId: number, staus: number, data: Movie[]): void {
  State[userId].staus = staus;
  State[userId].data = data;
}

export function getUserState(userId: number): UserState {
  if (State[userId]) return State[userId];

  const newState: UserState = {
    staus: STATE_USER_IDLE,
    data: [],
    timestamp: 0,
  };

  State[userId] = newState;
  return newState;
}

export async function handleMovieSearch(
  bot: TelegramBot,
  msg: TelegramBot.Message,
): Promise<void> {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
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
    await sendListOfMovies(bot, chatId, movies);
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
