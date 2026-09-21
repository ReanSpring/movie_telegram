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
  
  
  // Watch Now button - Using custom URL or falling back to clean stream servers
  let tmdbId = movie.tmdb_id;
  if (!tmdbId && movie.watch_now_url) {
    const match = movie.watch_now_url.match(/(?:movie(?:\/tmdb)?\/|embed\/movie\/|tmdb=)(\d+)/);
    if (match) tmdbId = match[1];
  }
  const id = tmdbId || movie.id;

  const isEmbedScraper = movie.watch_now_url && (
    movie.watch_now_url.includes('vidlink.pro') ||
    movie.watch_now_url.includes('autoembed.co') ||
    movie.watch_now_url.includes('vidsrc')
  );

  const isCustomDirectUrl = movie.watch_now_url && !isEmbedScraper;
  const defaultWatchUrl = isCustomDirectUrl ? movie.watch_now_url : `https://vidlink.pro/movie/${id}`;

  if (isCustomDirectUrl) {
    buttons.push([{
      text: '▶️ Watch Now',
      url: defaultWatchUrl
    }]);
  } else {
    buttons.push([
      { text: '⚡ Server 1 (Clean)', url: `https://vidlink.pro/movie/${id}` },
      { text: '📺 Server 2', url: `https://autoembed.co/movie/tmdb/${id}` }
    ]);
  }
  
  // Watch in Telegram (Web App)
  // Telegram WebApp strictly requires an absolute HTTPS URL.
  const appUrl = process.env.APP_URL || '';
  if (appUrl.startsWith('https://')) {
    const webAppUrl = `${appUrl}/player.html?id=${id}&tmdb_id=${tmdbId || ''}&url=${encodeURIComponent(defaultWatchUrl)}`;
    buttons.push([{
      text: '📱 Watch in Telegram (No Ads)',
      web_app: {
        url: webAppUrl
      }
    }]);
  }

  // Delete option (Admin only conceptually, but for now available)
  buttons.push([{
    text: '🗑 Delete Movie',
    callback_data: `delete:${movie.id}`
  }]);
  
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
  
  // Watch Now button - Using custom URL or falling back to clean stream servers
  let tmdbId = movie.tmdb_id;
  if (!tmdbId && movie.watch_now_url) {
    const match = movie.watch_now_url.match(/(?:movie(?:\/tmdb)?\/|embed\/movie\/|tmdb=)(\d+)/);
    if (match) tmdbId = match[1];
  }
  const id = tmdbId || movie.id;

  const isEmbedScraper = movie.watch_now_url && (
    movie.watch_now_url.includes('vidlink.pro') ||
    movie.watch_now_url.includes('autoembed.co') ||
    movie.watch_now_url.includes('vidsrc')
  );

  const isCustomDirectUrl = movie.watch_now_url && !isEmbedScraper;
  const defaultWatchUrl = isCustomDirectUrl ? movie.watch_now_url : `https://vidlink.pro/movie/${id}`;

  if (isCustomDirectUrl) {
    row1.push({
      text: '▶️ Watch Now',
      url: defaultWatchUrl
    });
  } else {
    row1.push({
      text: '⚡ Stream 1 (Clean)',
      url: `https://vidlink.pro/movie/${id}`
    });
    row1.push({
      text: '📺 Stream 2',
      url: `https://autoembed.co/movie/tmdb/${id}`
    });
  }
  
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
    const webAppUrl = `${appUrl}/player.html?id=${id}&tmdb_id=${tmdbId || ''}&url=${encodeURIComponent(defaultWatchUrl)}`;
    row2.push({
      text: '📱 Watch in Telegram (No Ads)',
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

/**
 * Create inline keyboard for TMDb movie details view
 */
const createTmdbMovieKeyboard = (movie) => {
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

  // Working streaming servers for TMDb movies
  const stream1 = `https://vidlink.pro/movie/${movie.id}`;
  const stream2 = `https://autoembed.co/movie/tmdb/${movie.id}`;

  const appUrl = process.env.APP_URL || '';
  if (appUrl.startsWith('https://')) {
    const webAppUrl = `${appUrl}/player.html?id=${movie.id}&url=${encodeURIComponent(stream1)}`;
    buttons.push([{
      text: '📱 Watch in Telegram (No Ads)',
      web_app: {
        url: webAppUrl
      }
    }]);
  }

  buttons.push([
    { text: '▶️ Stream Server 1 (Clean)', url: stream1 },
    { text: '▶️ Stream Server 2 (AutoEmbed)', url: stream2 }
  ]);

  // Import button to save into local collection
  buttons.push([{
    text: '📥 Import to Local Collection',
    callback_data: `import:${movie.id}`
  }]);

  return {
    inline_keyboard: buttons
  };
};

/**
 * Create inline keyboard for TMDb movies list
 */
const createTmdbListKeyboard = (movies, limit = 8) => {
  const buttons = [];

  movies.slice(0, limit).forEach(movie => {
    const title = movie.title || 'Unknown';
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    buttons.push([
      {
        text: `🔍 ${title} (${year})`,
        callback_data: `tmdb_watch:${movie.id}`
      },
      {
        text: '📥 Import',
        callback_data: `import:${movie.id}`
      }
    ]);
  });

  return {
    inline_keyboard: buttons
  };
};

/**
 * Create keyboard for searching TMDb when local search has no results
 */
const createSearchFallbackKeyboard = (query) => {
  return {
    inline_keyboard: [
      [{
        text: `🌐 Search TMDb for "${query.slice(0, 30)}"`,
        callback_data: `tmdb_search:${query}`
      }]
    ]
  };
};

module.exports = {
  createMovieKeyboard,
  createMovieListKeyboard,
  createChannelPostKeyboard,
  createImportResultsKeyboard,
  createTmdbMovieKeyboard,
  createTmdbListKeyboard,
  createSearchFallbackKeyboard
};

