import TelegramBot from 'node-telegram-bot-api';
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

let TrackedMessages: MovieMessage[] = [];

export function trackMessage(message: TelegramBot.Message): void {
  const msg = {
    chatId: message.chat.id,
    messageId: message.message_id,
    timestamp: getTimestamp(),
  };

  TrackedMessages.push(msg);
}

async function sendMovieMessage(
  bot: TelegramBot,
  movie: Movie,
  chatId: number,
  options: TelegramBot.SendMessageOptions,
): Promise<void> {
  const msg = `${movie.title} [${movie.year}] <a href="${movie.medium_cover_image}">&#8205;</a>`;

  const message = await bot.sendMessage(chatId, msg, {
    parse_mode: 'HTML',
    disable_web_page_preview: false,
    ...options,
  });

  trackMessage(message);
  await delay(1200);
}

export async function sendListOfMovies(
  bot: TelegramBot,
  chatId: number,
  searchResults: MovieSearchResult,
): Promise<void> {
  if (searchResults.data.movies.length === 0) {
    await bot.sendMessage(chatId, 'Failed to get movies');
    return;
  }

  for (let i = 0; i < searchResults.data.movies.length; i++) {
    const movie = searchResults.data.movies[i];
    const options = createSelectionButtons(movie.id);
    await sendMovieMessage(bot, movie, chatId, options);
  }
}

function createSelectionButtons(
  movieID: number,
): TelegramBot.SendMessageOptions {
  const buttons: TelegramBot.InlineKeyboardButton[][] = [];

  buttons.push([
    {
      text: 'Download',
      callback_data: `${movieID}`,
    },
  ]);

  const options: TelegramBot.SendMessageOptions = {
    reply_markup: {
      inline_keyboard: buttons,
    },
  };

  return options;
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
  TrackedMessages = TrackedMessages.filter((message) => {
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
