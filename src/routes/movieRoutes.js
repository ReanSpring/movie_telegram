const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// GET /api/movies/trending
router.get('/trending', movieController.getTrending);

// GET /api/movies/search?q=query
router.get('/search', movieController.searchMovies);

// GET /api/movies/:id
router.get('/:id', movieController.getMovieDetails);

module.exports = router;
