import { details, search } from 'yts-api-node';
import {
  Movie,
  MovieDetails,
  MovieSearchResult,
  Torrent,
} from './types/movies.js';
import { delay } from './utility.js';

// Function to search movies
export async function searchMovies(
  query: string,
  limit = 10,
  maxTries = 5,
): Promise<MovieSearchResult> {
  const retryDelay = 3000;
  let tries = 0;

  while (tries < maxTries) {
    try {
      const results: MovieSearchResult = await search({
        query_term: query,
        limit: limit,
        sort_by: 'download_count',
      });
      if (!results?.data?.movies) {
        console.error('movies::searchMovies Did not get any movie');
        throw 'Did not get any movie';
      }
      return results;
    } catch (e) {
      /* handle error */
      console.error(
        `main::searchMovies failed to get results. Retrying in ${retryDelay} ms.`,
        `Try ${tries + 1} of ${maxTries}`,
      );
      await delay(retryDelay);
    }
    tries++;
  }

  throw 'Failed to find movies';
}

// Function to get details for a movie
export async function getMovieDetails(
  movieId: number,
  maxTries = 5,
): Promise<MovieDetails | null> {
  const retryDelay = 3000;
  let tries = 0;

  while (tries < maxTries) {
    try {
      const movieDetails: MovieDetails = await details({
        movie_id: movieId,
      });
      return movieDetails;
    } catch (e) {
      /* handle error */
      console.error(
        `main::getMovieDetails failed to get details. Retrying in ${retryDelay} ms.`,
        `Try ${tries + 1} of ${maxTries}`,
      );
      await delay(retryDelay);
    }
    tries++;
  }

  return null;
}

// Function to get movie from search results
export async function getMovieFromSearchResults(
  searchResults: MovieSearchResult,
  index: number,
): Promise<Movie | null> {
  if (!searchResults?.data?.movies) {
    return null;
  }
  if (searchResults.data.movies.length < index) {
    return null;
  }
  return searchResults.data.movies[index];
}

// function to get torrents from Movie
export function getTorrents(movie: Movie): Torrent[] {
  return movie.torrents;
}
