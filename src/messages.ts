import { MovieSearchResult, Torrent } from './types/movies.js';

export function getListOfMoviesAsMessage(
  searchResults: MovieSearchResult,
): string {
  if (searchResults.data.movies.length === 0) {
    return 'No movies found';
  }

  let message = 'Movies found: \n 0. Back \n';
  for (let i = 0; i < searchResults.data.movies.length; i++) {
    message += `${i + 1}. ${searchResults.data.movies[i].title} \n`;
  }

  return message;
}

export function getTorrentLinkFromTorrents(torrents: Torrent[]): string {
  let message = 'Torrents found: \n';
  torrents.forEach(
    (torrent) => (message += `[${torrent.quality}]\n${torrent.url} \n\n`),
  );

  return message;
}
