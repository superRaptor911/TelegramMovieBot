import { MovieSearchResult, Torrent } from './types/movies.js';

export function getListOfMoviesAsMessage(
  searchResults: MovieSearchResult,
): string {
  let message = 'Movies found: \n';
  for (let i = 0; i < searchResults.data.movies.length; i++) {
    message += `${i + 1}. ${searchResults.data.movies[i].title} \n`;
  }
  return message;
}

export function getTorrentLinkFromTorrent(torrent: Torrent): string {
  let message = 'Torrents found: \n';
  message += `${torrent.url} \n`;

  return message;
}
