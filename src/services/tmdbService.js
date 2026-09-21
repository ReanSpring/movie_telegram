const axios = require('axios');
const config = require('../config/config');

class TmdbService {
  constructor() {
    this.apiKey = config.tmdb.apiKey;
    this.baseUrl = config.tmdb.baseUrl;
  }

  /**
   * Get trending movies from TMDb
   */
  async getTrending(timeWindow = 'day', page = 1) {
    try {
      const response = await axios.get(`${this.baseUrl}/trending/movie/${timeWindow}`, {
        params: {
          api_key: this.apiKey,
          page
        }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching trending from TMDb:', error.message);
      throw new Error('Failed to fetch trending movies from TMDb');
    }
  }

  /**
   * Get popular movies from TMDb
   */
  async getPopular(page = 1) {
    try {
      const response = await axios.get(`${this.baseUrl}/movie/popular`, {
        params: {
          api_key: this.apiKey,
          page
        }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching popular movies from TMDb:', error.message);
      throw new Error('Failed to fetch popular movies from TMDb');
    }
  }

  /**
   * Search TMDb for movies
   */
  async searchTmdb(query, page = 1) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query,
          page
        }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching TMDb:', error.message);
      throw new Error('Failed to search TMDb');
    }
  }

  /**
   * Get detailed info from TMDb for a specific movie
   */
  async getDetails(tmdbId) {
    try {
      const response = await axios.get(`${this.baseUrl}/movie/${tmdbId}`, {
        params: {
          api_key: this.apiKey,
          append_to_response: 'credits,videos'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching TMDb details:', error.message);
      throw new Error('Failed to fetch TMDb details');
    }
  }

  /**
   * Format TMDb movie object into consistent structure
   */
  formatTmdbMovie(movie) {
    if (!movie) return null;
    return {
      id: movie.id,
      tmdb_id: movie.id,
      title: movie.title || movie.original_title,
      overview: movie.overview,
      release_date: movie.release_date,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      vote_average: movie.vote_average || 0,
      poster_path: movie.poster_path ? (movie.poster_path.startsWith('http') ? movie.poster_path : `${config.tmdb.imageBaseUrl}${movie.poster_path}`) : null,
      backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      genres: movie.genres || [],
      runtime: movie.runtime,
      imdb_id: movie.imdb_id,
      videos: movie.videos || { results: [] },
      watch_now_url: `https://autoembed.co/movie/tmdb/${movie.id}`,
      source: 'tmdb'
    };
  }
}

module.exports = new TmdbService();

