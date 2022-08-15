import TelegramBot from 'node-telegram-bot-api';
import { handleMovieSearch, handleMovieSelection } from './bot.js';
import { Movie } from './types/movies.js';

export const STATE_USER_IDLE = 0;
export const STATE_USER_SEARCHING = 1;
export const STATE_USER_SELECTION_MODE = 2;

interface UserState {
  staus: number;
  timestamp: number;
  data: Movie[];
}

const State: { [key: number]: UserState } = {};

export function setUserState(
  userId: number,
  staus: number,
  data: Movie[],
): void {
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

export function manageState(bot: TelegramBot, msg: TelegramBot.Message): void {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userState = getUserState(userId);

  if (userState.staus === STATE_USER_IDLE) handleMovieSearch(bot, msg);
  else if (
    userState.staus === STATE_USER_SEARCHING ||
    userState.staus === STATE_USER_SELECTION_MODE
  )
    handleMovieSelection(bot, msg);
  else bot.sendMessage(chatId, 'An error occured');
}
