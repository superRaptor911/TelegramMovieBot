import { MovieSearchResult, Torrent } from './types/movies.js';

export function getListOfMoviesAsMessages(
  searchResults: MovieSearchResult,
): string[] {
  if (searchResults.data.movies.length === 0) {
    return ['No movies found'];
  }

  const messages = ['Movies found: \n0. Back \n'];
  for (let i = 0; i < searchResults.data.movies.length; i++) {
    const movie = searchResults.data.movies[i];
    messages.push(
      `${i + 1}. ${movie.title} [${movie.year}] <a href="${
        movie.medium_cover_image
      }">&#8205;</a> \n`,
    );
  }

  return messages;
}

export function getTorrentLinkFromTorrents(torrents: Torrent[]): string {
  let message = 'Torrents found: \n';
  torrents.forEach(
    (torrent) => (message += `[${torrent.quality}]\n${torrent.url} \n\n`),
  );

  return message;
}
