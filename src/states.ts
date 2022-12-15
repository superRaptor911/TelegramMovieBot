import TelegramBot from 'node-telegram-bot-api';
import { handleMovieSearch, handleMovieSelection } from './bot.js';
import { Movie } from './types/movies.js';
import { getTimestamp, isTimeOlderThan } from './utility.js';

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
  prevStatus?: number,
): void {
  if (prevStatus && State[userId].staus !== prevStatus) {
    return;
  }
  State[userId].staus = staus;
  State[userId].data = data;
  State[userId].timestamp = getTimestamp();
}

export function getUserState(userId: number): UserState {
  if (State[userId]) return State[userId];

  const newState: UserState = {
    staus: STATE_USER_IDLE,
    data: [],
    timestamp: getTimestamp(),
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

export function cleanExpiredStates(maxAge = 60): void {
  const maxAgeInMs = maxAge * 1000;
  for (const key in State) {
    if (isTimeOlderThan(State[key].timestamp, maxAgeInMs)) {
      console.log('Clearing state for user ' + key);
      delete State[key];
    }
  }
}
