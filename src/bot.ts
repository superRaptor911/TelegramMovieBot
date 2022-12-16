import TelegramBot from 'node-telegram-bot-api';
import { sendListOfMovies, sendListOfTorrents } from './messages.js';
import { getMovieDetailsFromID, searchMovies } from './movies.js';
import { writeUsageToSheet } from './sheets/googleSheet.js';

export async function handleMovieSearch(
  bot: TelegramBot,
  msg: TelegramBot.Message,
): Promise<void> {
  const chatId = msg.chat.id;

  const username = msg.from.username || msg.from.first_name;
  const message = msg.text;
  writeUsageToSheet(username, message);

  try {
    const movieName = msg.text.replaceAll('/', '');
    bot.sendMessage(chatId, 'Searching for ' + movieName);

    if (movieName == 'start') {
      bot.sendMessage(
        chatId,
        "I'm ready to search for movies! enter to search for movies",
      );
      return;
    }
    console.log(`Searching for ${movieName}`);
    const movies = await searchMovies(movieName);
    await sendListOfMovies(bot, chatId, movies);
  } catch (e) {
    /* handle error */
    console.error(`main::handleMovieSearch failed to get movies.`, e);
    bot.sendMessage(chatId, 'Failed to get movies');
  }
}

export async function handleMovieSelection(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  selection: string,
): Promise<void> {
  const chatId = msg.chat.id;

  try {
    console.log(`Getting movie ${selection}`);
    const movieDetails = await getMovieDetailsFromID(Number(selection));

    console.log(`Got movie `, movieDetails.data.movie.title);
    const torrents = movieDetails.data.movie.torrents;
    const movieName = movieDetails.data.movie.title;
    await sendListOfTorrents(bot, chatId, torrents, movieName);
  } catch (e) {
    /* handle error */
    console.error('bot::handleMovieSelection failed to select movie.', e);
    bot.sendMessage(chatId, 'Something went wrong');
  }
}
