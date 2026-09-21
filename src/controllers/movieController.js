const movieService = require('../services/movieService');

/**
 * Get trending movies
 */
const getTrending = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const source = req.query.source || 'local';
    const movies = await movieService.getTrendingMovies(page, source);
    
    res.json({
      success: true,
      source,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Search movies
 */
const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const source = req.query.source || 'local';
    const movies = await movieService.searchMovies(q, page, source);
    
    res.json({
      success: true,
      source,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get movie details
 */
const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await movieService.getMovieDetails(id);
    
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get trending movies directly from TMDb
 */
const getTmdbTrending = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const movies = await movieService.getTmdbTrending(page);
    
    res.json({
      success: true,
      source: 'tmdb',
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Search movies on TMDb
 */
const searchTmdb = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const movies = await movieService.searchTmdb(q, page);
    
    res.json({
      success: true,
      source: 'tmdb',
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get movie details from TMDb
 */
const getTmdbDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await movieService.getTmdbMovieDetails(id);
    
    res.json({
      success: true,
      source: 'tmdb',
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all movies from local database
 */
const getAllLocalMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const movies = await movieService.getAllLocalMovies(limit);
    
    res.json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getTrending,
  searchMovies,
  getMovieDetails,
  getTmdbTrending,
  searchTmdb,
  getTmdbDetails,
  getAllLocalMovies
};


