/**
 * Create inline keyboard with viewing options
 */
const createMovieKeyboard = (movie) => {
  const buttons = [];
  
  // IMDb button
  if (movie.imdb_id) {
    buttons.push([{
      text: '🎬 View on IMDb',
      url: `https://www.imdb.com/title/${movie.imdb_id}`
    }]);
  }
  
  // YouTube trailer button
  if (movie.videos && movie.videos.results && movie.videos.results.length > 0) {
    const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (trailer) {
      buttons.push([{
        text: '🎥 Watch Trailer',
        url: `https://www.youtube.com/watch?v=${trailer.key}`
      }]);
    }
  }
  
  
  // Watch Now button - Using custom URL or falling back to vidsrc.xyz
  const watchUrl = movie.watch_now_url || `https://vidsrc.xyz/embed/movie/${movie.id}`;
  buttons.push([{
    text: '▶️ Watch Now',
    url: watchUrl
  }]);
  
  // Watch in Telegram (Web App)
  // Telegram WebApp strictly requires an absolute HTTPS URL.
  const appUrl = process.env.APP_URL || '';
  if (appUrl.startsWith('https://')) {
    const webAppUrl = `${appUrl}/player.html?id=${movie.id}&url=${encodeURIComponent(watchUrl)}`;
    buttons.push([{
      text: '📱 Watch in Telegram',
      web_app: {
        url: webAppUrl
      }
    }]);
  } else {
    // Optional: Log that web_app button is skipped due to non-HTTPS URL
    // console.log('Skipping Watch in Telegram button: APP_URL is not HTTPS');
  }
  
  return {
    inline_keyboard: buttons
  };
};

/**
 * Create inline keyboard for a list of movies with callback buttons
 */
const createMovieListKeyboard = (movies, limit = 10) => {
  const buttons = [];
  
  movies.slice(0, limit).forEach(movie => {
    const title = movie.title || 'Unknown';
    buttons.push([{
      text: `🔍 View ${title}`,
      callback_data: `watch:${movie.id}`
    }]);
  });
  
  return {
    inline_keyboard: buttons
  };
};

/**
 * Create inline keyboard for channel posts with limited options
 */
const createChannelPostKeyboard = (movie) => {
  const buttons = [];
  const row1 = [];
  const row2 = [];
  
  // Watch Now button - Using custom URL or falling back to vidsrc.xyz
  const watchUrl = movie.watch_now_url || `https://vidsrc.xyz/embed/movie/${movie.id}`;
  row1.push({
    text: '▶️ Watch Now',
    url: watchUrl
  });
  
  // YouTube trailer button
  if (movie.videos && movie.videos.results && movie.videos.results.length > 0) {
    const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (trailer) {
      row1.push({
        text: '🎥 Watch Trailer',
        url: `https://www.youtube.com/watch?v=${trailer.key}`
      });
    }
  }

  // Watch in Telegram (Opens in in-app browser for channels)
  const appUrl = process.env.APP_URL || '';
  if (appUrl.startsWith('https://')) {
    const webAppUrl = `${appUrl}/player.html?id=${movie.id}&url=${encodeURIComponent(watchUrl)}`;
    row2.push({
      text: '📱 Watch in Telegram',
      url: webAppUrl
    });
  }

  const keyboard = [row1];
  if (row2.length > 0) {
    keyboard.push(row2);
  }

  return {
    inline_keyboard: keyboard
  };
};

/**
 * Create inline keyboard for TMDb search results (Import flow)
 */
const createImportResultsKeyboard = (results, limit = 5) => {
  const buttons = [];
  
  results.slice(0, limit).forEach(movie => {
    const title = movie.title || 'Unknown';
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    buttons.push([{
      text: `📥 Import: ${title} (${year})`,
      callback_data: `import:${movie.id}`
    }]);
  });
  
  return {
    inline_keyboard: buttons
  };
};

module.exports = {
  createMovieKeyboard,
  createMovieListKeyboard,
  createChannelPostKeyboard,
  createImportResultsKeyboard
};
