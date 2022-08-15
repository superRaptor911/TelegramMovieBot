import TelegramBot from 'node-telegram-bot-api';
import { getUserState, STATE_USER_SELECTION_MODE } from './states.js';
import { MovieSearchResult, Torrent } from './types/movies.js';
import { delay, downloadFileAsBuffer } from './utility.js';

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
    const movie = searchResults.data.movies[i];
    const msg = `${i + 1}. ${movie.title} [${movie.year}] <a href="${
      movie.medium_cover_image
    }">&#8205;</a>`;

    await bot.sendMessage(chatId, msg, {
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });
    await delay(1200);

    const state = getUserState(userId);
    if (state.staus === STATE_USER_SELECTION_MODE) {
      break;
    }
  }

  await bot.sendMessage(
    chatId,
    'Please select a movie by typing the number\n0 to exit',
  );
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
