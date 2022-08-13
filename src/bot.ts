import TelegramBot from 'node-telegram-bot-api';
import {
  getListOfMoviesAsMessages,
  getTorrentLinkFromTorrents,
} from './messages.js';
import { searchMovies } from './movies.js';
import { Movie } from './types/movies.js';
import { delay } from './utility.js';

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
      return;
    }
    console.log(`Searching for ${movieName}`);
    const movies = await searchMovies(movieName);

    setUserState(userId, STATE_USER_SEARCHING, movies.data.movies);
    const messages = getListOfMoviesAsMessages(movies);

    for (let i = 0; i < messages.length; i++) {
      bot.sendMessage(chatId, messages[i], {
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });
      await delay(1200);
    }
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
      throw `input is not a number: ${input}`;
    }

    const num = parseInt(input, 10);
    if (num === 0) {
      setUserState(userId, STATE_USER_IDLE, []);
      bot.sendMessage(chatId, 'Back to search');
      return;
    }

    const movies = getUserState(userId).data;
    if (num < 1 || num > movies.length) {
      throw `input is out of range: ${num}`;
    }

    const torrents = movies[num - 1].torrents;
    bot.sendMessage(chatId, getTorrentLinkFromTorrents(torrents));
    setUserState(userId, STATE_USER_IDLE, []);
  } catch (e) {
    /* handle error */
    console.error('bot::handleMovieSelection failed to select movie.', e);
    bot.sendMessage(chatId, 'Invalid input');
    bot.sendMessage(chatId, 'Please select a movie by typing the number');
  }
}
