const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// GET /api/movies (all local movies)
router.get('/', movieController.getAllLocalMovies);
router.get('/all', movieController.getAllLocalMovies);

// GET /api/movies/tmdb/trending
router.get('/tmdb/trending', movieController.getTmdbTrending);

// GET /api/movies/tmdb/search?q=query
router.get('/tmdb/search', movieController.searchTmdb);

// GET /api/movies/tmdb/:id
router.get('/tmdb/:id', movieController.getTmdbDetails);

// GET /api/movies/trending
router.get('/trending', movieController.getTrending);

// GET /api/movies/search?q=query
router.get('/search', movieController.searchMovies);

// GET /api/movies/:id
router.get('/:id', movieController.getMovieDetails);

module.exports = router;
