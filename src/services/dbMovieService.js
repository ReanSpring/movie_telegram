const db = require('./database');

class DbMovieService {
  /**
   * Add a new movie to the database
   */
  async addMovie(movieData) {
    const { title, description, year, rating, poster_url, watch_url, trailer_url } = movieData;
    const stmt = db.prepare(`
      INSERT INTO movies (title, description, year, rating, poster_url, watch_url, trailer_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(title, description, year, rating, poster_url, watch_url, trailer_url);
    return { id: info.lastInsertRowid, ...movieData };
  }

  /**
   * Get all movies (paged)
   */
  async getTrendingMovies(limit = 10) {
    const stmt = db.prepare('SELECT * FROM movies ORDER BY created_at DESC LIMIT ?');
    return stmt.all(limit);
  }

  /**
   * Search for movies by title
   */
  async searchMovies(query) {
    const stmt = db.prepare('SELECT * FROM movies WHERE title LIKE ? ORDER BY created_at DESC');
    return stmt.all(`%${query}%`);
  }

  /**
   * Get detailed information about a specific movie
   */
  async getMovieDetails(movieId) {
    const stmt = db.prepare('SELECT * FROM movies WHERE id = ?');
    return stmt.get(movieId);
  }

  /**
   * Helper to format local movie for the message
   * Since we might have different field names than TMDb
   */
  formatForBot(movie) {
    if (!movie) return null;
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.description,
      release_date: movie.year ? `${movie.year}-01-01` : null,
      vote_average: movie.rating || 0,
      poster_path: movie.poster_url, // Using full URL directly
      watch_now_url: movie.watch_url,
      videos: {
        results: movie.trailer_url ? [{ type: 'Trailer', site: 'YouTube', key: this.extractYoutubeId(movie.trailer_url) }] : []
      }
    };
  }

  extractYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  }
}

module.exports = new DbMovieService();
