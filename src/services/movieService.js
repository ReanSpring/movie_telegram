const config = require('../config/config');
const dbMovieService = require('./dbMovieService');
const tmdbService = require('./tmdbService');

class MovieService {
  constructor() {
    this.apiKey = config.tmdb.apiKey;
    this.baseUrl = config.tmdb.baseUrl;
    this.imageBaseUrl = config.tmdb.imageBaseUrl;
  }

  /**
   * Get trending movies (from local DB or TMDb)
   */
  async getTrendingMovies(page = 1, source = 'local') {
    if (source === 'tmdb') {
      return await this.getTmdbTrending(page);
    }
    const movies = await dbMovieService.getTrendingMovies();
    return movies.map(m => dbMovieService.formatForBot(m));
  }

  /**
   * Get all movies from local database
   */
  async getAllLocalMovies(limit = 100) {
    const movies = await dbMovieService.getAllMovies(limit);
    return movies.map(m => dbMovieService.formatForBot(m));
  }

  /**
   * Search for movies (from local DB or TMDb)
   */
  async searchMovies(query, page = 1, source = 'local') {
    if (source === 'tmdb') {
      return await this.searchTmdb(query, page);
    }
    const movies = await dbMovieService.searchMovies(query);
    return movies.map(m => dbMovieService.formatForBot(m));
  }

  /**
   * Get trending movies directly from TMDb
   */
  async getTmdbTrending(page = 1) {
    const results = await tmdbService.getTrending('day', page);
    return results.map(m => tmdbService.formatTmdbMovie(m));
  }

  /**
   * Search movies directly on TMDb
   */
  async searchTmdb(query, page = 1) {
    const results = await tmdbService.searchTmdb(query, page);
    return results.map(m => tmdbService.formatTmdbMovie(m));
  }

  /**
   * Get movie details from TMDb
   */
  async getTmdbMovieDetails(tmdbId) {
    const details = await tmdbService.getDetails(tmdbId);
    return tmdbService.formatTmdbMovie(details);
  }

  /**
   * Get detailed information about a specific movie (from local DB)
   */
  async getMovieDetails(movieId) {
    const movie = await dbMovieService.getMovieDetails(movieId);
    if (!movie) throw new Error('Movie not found');
    return dbMovieService.formatForBot(movie);
  }

  /**
   * Add a movie to the local DB
   */
  async addMovie(movieData) {
    return await dbMovieService.addMovie(movieData);
  }

  /**
   * Update a movie URL in the local DB
   */
  async updateMovieUrl(movieId, watchUrl) {
    return await dbMovieService.updateMovieUrl(movieId, watchUrl);
  }

  /**
   * Delete a movie from the local DB
   */
  async deleteMovie(movieId) {
    return await dbMovieService.deleteMovie(movieId);
  }

  /**
   * Get full poster URL (Handles both paths and full URLs)
   */
  getPosterUrl(posterPath) {
    if (!posterPath) return null;
    if (posterPath.startsWith('http')) return posterPath;
    return `${this.imageBaseUrl}${posterPath}`;
  }
}

module.exports = new MovieService();
