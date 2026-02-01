const config = require('../config/config');
const dbMovieService = require('./dbMovieService');

class MovieService {
  constructor() {
    this.apiKey = config.tmdb.apiKey;
    this.baseUrl = config.tmdb.baseUrl;
    this.imageBaseUrl = config.tmdb.imageBaseUrl;
  }

  /**
   * Get trending movies (from local DB)
   */
  async getTrendingMovies(page = 1) {
    const movies = await dbMovieService.getTrendingMovies();
    return movies.map(m => dbMovieService.formatForBot(m));
  }

  /**
   * Search for movies (from local DB)
   */
  async searchMovies(query, page = 1) {
    const movies = await dbMovieService.searchMovies(query);
    return movies.map(m => dbMovieService.formatForBot(m));
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
   * Get full poster URL (Handles both paths and full URLs)
   */
  getPosterUrl(posterPath) {
    if (!posterPath) return null;
    if (posterPath.startsWith('http')) return posterPath;
    return `${this.imageBaseUrl}${posterPath}`;
  }
}

module.exports = new MovieService();
