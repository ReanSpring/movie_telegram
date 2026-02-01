const movieService = require('../services/movieService');

/**
 * Get trending movies
 */
const getTrending = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const movies = await movieService.getTrendingMovies(page);
    
    res.json({
      success: true,
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
    const movies = await movieService.searchMovies(q, page);
    
    res.json({
      success: true,
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

module.exports = {
  getTrending,
  searchMovies,
  getMovieDetails
};
