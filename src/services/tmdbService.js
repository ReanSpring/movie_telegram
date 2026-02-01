const axios = require('axios');
const config = require('../config/config');

class TmdbService {
  constructor() {
    this.apiKey = config.tmdb.apiKey;
    this.baseUrl = config.tmdb.baseUrl;
  }

  /**
   * Search TMDb for movies to import
   */
  async searchTmdb(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query
        }
      });
      return response.data.results;
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
}

module.exports = new TmdbService();
