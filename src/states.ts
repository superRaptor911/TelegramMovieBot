import { Movie } from './types/movies.js';
import { getTimestamp, isTimeOlderThan } from './utility.js';

export const STATE_USER_IDLE = 0;
export const STATE_USER_SEARCHING = 1;
export const STATE_USER_SELECTION_MODE = 2;

interface UserState {
  stateID: number;
  timestamp: number;
  data: Movie[];
}

const State: { [key: number]: UserState } = {};

export function setUserState(
  userId: number,
  status: number,
  data: Movie[],
  prevStateID?: number,
): void {
  if (prevStateID && State[userId].stateID !== prevStateID) {
    return;
  }
  State[userId].stateID = status;
  State[userId].data = data;
  State[userId].timestamp = getTimestamp();
}

export function getUserState(userId: number): UserState {
  if (State[userId]) return State[userId];

  const newState: UserState = {
    stateID: STATE_USER_IDLE,
    data: [],
    timestamp: getTimestamp(),
  };

  State[userId] = newState;
  return newState;
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
