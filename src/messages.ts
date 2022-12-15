import TelegramBot from 'node-telegram-bot-api';
import { getUserState, STATE_USER_SEARCHING } from './states.js';
import { Movie, MovieSearchResult, Torrent } from './types/movies.js';
import {
  delay,
  downloadFileAsBuffer,
  getTimestamp,
  isTimeOlderThan,
} from './utility.js';

interface MovieMessage {
  chatId: number;
  messageId: number;
  timestamp: number;
}

let MovieMessages: MovieMessage[] = [];

function createMovieMessage(chatId: number, messageId: number): void {
  const message = {
    chatId: chatId,
    messageId: messageId,
    timestamp: getTimestamp(),
  };

  MovieMessages.push(message);
}

async function sendMovieMessage(
  bot: TelegramBot,
  movie: Movie,
  chatId: number,
  index: number,
): Promise<void> {
  const msg = `${index + 1}. ${movie.title} [${movie.year}] <a href="${
    movie.medium_cover_image
  }">&#8205;</a>`;

  const message = await bot.sendMessage(chatId, msg, {
    parse_mode: 'HTML',
    disable_web_page_preview: false,
  });

  createMovieMessage(chatId, message.message_id);
  await delay(1200);
}

export async function sendListOfMovies(
  bot: TelegramBot,
  chatId: number,
  searchResults: MovieSearchResult,
  userId: number,
): Promise<void> {
  if (searchResults.data.movies.length === 0) {
    await bot.sendMessage(chatId, 'Failed to get movies');
    return;
  }

  for (let i = 0; i < searchResults.data.movies.length; i++) {
    // Check if the user is still in the same state
    const state = getUserState(userId);
    if (state.staus !== STATE_USER_SEARCHING) {
      return;
    }

    const movie = searchResults.data.movies[i];
    await sendMovieMessage(bot, movie, chatId, i);
  }

  const message = await bot.sendMessage(
    chatId,
    'Please select a movie by typing the number\n0 to exit',
  );

  createMovieMessage(chatId, message.message_id);
}

export async function sendListOfTorrents(
  bot: TelegramBot,
  chatId: number,
  torrents: Torrent[],
  movieName: string,
): Promise<void> {
  for (const torrent of torrents) {
    const buffer = await downloadFileAsBuffer(torrent.url);
    bot.sendDocument(
      chatId,
      buffer,
      {},
      {
        filename: `${movieName} [${torrent.quality}] [${torrent.size}].torrent`,
        contentType: 'application/x-bittorrent',
      },
    );
  }
}

export async function cleanExpiredMessage(bot: TelegramBot): Promise<void> {
  MovieMessages = MovieMessages.filter((message) => {
    const expired = isTimeOlderThan(message.timestamp, 60000);
    if (expired) {
      const { chatId, messageId } = message;
      try {
        bot
          .deleteMessage(chatId, String(messageId))
          .then(() => console.log('Cleared message ' + messageId));
      } catch (e) {
        /* handle error */
        console.error('messages::cleanExpiredMessage failed to delete message');
      }
    }
    return !expired;
  });
}
