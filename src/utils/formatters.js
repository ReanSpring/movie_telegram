const escapeMarkdown = (text) => {
  if (!text) return '';
  // For Markdown (V1), we need to escape *, _, `, [
  // and we should be careful with other characters too.
  return text.replace(/([*_`\[\]])/g, '\\$1');
};

/**
 * Format movie data for Telegram messages
 */
const formatMovieMessage = (movie) => {
  const title = escapeMarkdown(movie.title || 'Unknown Title');
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const overview = escapeMarkdown(movie.overview || 'No description available.');
  
  // Create star rating
  const stars = '⭐'.repeat(Math.round(movie.vote_average / 2));
  
  let message = `🎬 *${title}* (${year})\n\n`;
  message += `${stars} ${rating}/10\n\n`;
  message += `📝 ${overview}\n\n`;
  
  if (movie.genres && movie.genres.length > 0) {
    const genres = escapeMarkdown(movie.genres.map(g => g.name).join(', '));
    message += `🎭 Genres: ${genres}\n`;
  }
  
  if (movie.runtime) {
    message += `⏱ Runtime: ${movie.runtime} min\n`;
  }
  
  // Add IMDb link if available
  if (movie.imdb_id) {
    message += `\n🔗 [View on IMDb](https://www.imdb.com/title/${movie.imdb_id})\n`;
  }
  
  // Add trailer info if available
  if (movie.videos && movie.videos.results && movie.videos.results.length > 0) {
    const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (trailer) {
      message += `🎥 [Watch Trailer](https://www.youtube.com/watch?v=${trailer.key})\n`;
    }
  }
  
  message += `\n🆔 ID: \`${movie.id}\``;
  
  return message;
};

/**
 * Format movie list for Telegram
 */
const formatMovieList = (movies, limit = 10) => {
  if (!movies || movies.length === 0) {
    return '❌ No movies found.';
  }
  
  let message = '🎬 *Movies:*\n\n';
  
  movies.slice(0, limit).forEach((movie, index) => {
    const title = movie.title || 'Unknown';
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    message += `${index + 1}. *${escapeMarkdown(title)}* (${year}) - ⭐ ${rating}\n`;
    message += `   ID: \`${movie.id}\`\n\n`;
  });
  
  if (movies.length > limit) {
    message += `\n_...and ${movies.length - limit} more_`;
  }
  
  return message;
};

module.exports = {
  formatMovieMessage,
  formatMovieList,
  escapeMarkdown
};
