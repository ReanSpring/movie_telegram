const movieService = require('../services/movieService');
const tmdbService = require('../services/tmdbService');
const sessionService = require('../services/sessionService');
const telegramService = require('../services/telegramService');
const { formatMovieList, formatMovieMessage, escapeMarkdown } = require('../utils/formatters');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../bot_debug.log');

const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logFilePath, logEntry);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
};

/**
 * Handle /start command
 */
const handleStart = async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🎬 *Welcome to Movie Bot!*

I can help you discover movies, browse TMDb, and share them to your Telegram channel.

*Local Database Commands:*
/mymovies - View all movies in your local collection
/trending - Get recently added movies from local database
/search <name> - Search your local collection
/watch <id> - View local movie with watch links
/post <id> - Post local movie to the channel
/addmovie <data> - Add movie manually
/editurl <id> <url> - Update movie watch link
/deletemovie <id> - Delete a movie

*TMDb (The Movie Database) Commands:*
/tmdbtrending - Fetch top trending movies directly from TMDb
/tmdb <name> - Search any movie on TMDb
/watchtmdb <tmdbId> - View details for a TMDb movie
/import <name> - Search TMDb and import to your database

/help - Show this help message

Let's get started! 🍿
  `;

  await telegramService.sendMessage(chatId, welcomeMessage);
};

/**
 * Handle /help command
 */
const handleHelp = async (msg) => {
  await handleStart(msg);
};

/**
 * Handle /mymovies or /list command - view all local movies
 */
const handleMyMovies = async (msg) => {
  const chatId = msg.chat.id;

  try {
    const movies = await movieService.getAllLocalMovies(50);
    if (movies.length === 0) {
      await telegramService.sendMessage(
        chatId,
        '📁 *Your Local Collection is Empty!*\n\nUse `/tmdb <name>` or `/import <name>` to find and add movies.'
      );
      return;
    }

    const message = formatMovieList(movies, 50, `Your Local Movies (${movies.length})`);
    const { createMovieListKeyboard } = require('../utils/keyboard');
    const keyboard = createMovieListKeyboard(movies, 15);

    await telegramService.sendMessage(chatId, message, {
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error fetching local movies:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to fetch your local movies.');
  }
};

/**
 * Handle /trending command (local DB)
 */
const handleTrending = async (msg) => {
  const chatId = msg.chat.id;

  try {
    await telegramService.sendMessage(chatId, '🔍 Fetching trending movies from local database...');
    
    const movies = await movieService.getTrendingMovies();
    if (movies.length === 0) {
      await telegramService.sendMessage(
        chatId,
        'ℹ️ Your local movie database is currently empty.\n\nTry `/tmdbtrending` to see trending movies on TMDb or `/import <movie>` to add some!'
      );
      return;
    }

    const message = formatMovieList(movies, 10, 'Local Trending Movies');
    const { createMovieListKeyboard } = require('../utils/keyboard');
    const keyboard = createMovieListKeyboard(movies);

    await telegramService.sendMessage(chatId, message, {
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to fetch trending movies. Please try again later.');
  }
};

/**
 * Handle /tmdbtrending command (TMDb)
 */
const handleTmdbTrending = async (msg) => {
  const chatId = msg.chat.id;

  try {
    await telegramService.sendMessage(chatId, '🔥 Fetching trending movies from TMDb...');
    
    const movies = await movieService.getTmdbTrending(1);
    const message = formatMovieList(movies, 10, 'TMDb Trending Movies');
    const { createTmdbListKeyboard } = require('../utils/keyboard');
    const keyboard = createTmdbListKeyboard(movies);

    await telegramService.sendMessage(chatId, message, {
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error fetching TMDb trending:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to fetch trending movies from TMDb. Please try again.');
  }
};

/**
 * Handle /search command (local DB with TMDb fallback option)
 */
const handleSearch = async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  if (!query || query.trim() === '') {
    await telegramService.sendMessage(chatId, '❌ Please provide a movie name.\n\nExample: /search inception');
    return;
  }

  try {
    await telegramService.sendMessage(chatId, `🔍 Searching local collection for "${query}"...`);
    
    const movies = await movieService.searchMovies(query);
    
    if (movies.length === 0) {
      const { createSearchFallbackKeyboard } = require('../utils/keyboard');
      await telegramService.sendMessage(
        chatId,
        `❌ No local movies found for "*${escapeMarkdown(query)}*".\n\nWould you like to search on TMDb?`,
        { reply_markup: createSearchFallbackKeyboard(query) }
      );
      return;
    }

    const message = formatMovieList(movies, 10, `Local Results for "${query}"`);
    const { createMovieListKeyboard } = require('../utils/keyboard');
    const keyboard = createMovieListKeyboard(movies);

    await telegramService.sendMessage(chatId, message, {
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error searching movies:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to search movies. Please try again later.');
  }
};

/**
 * Handle /tmdb command - Search directly on TMDb
 */
const handleTmdbSearch = async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  if (!query || query.trim() === '') {
    await telegramService.sendMessage(chatId, '❌ Please provide a movie name to search on TMDb.\n\nExample: /tmdb Avatar');
    return;
  }

  try {
    await telegramService.sendMessage(chatId, `🔍 Searching TMDb for "${query}"...`);
    const movies = await movieService.searchTmdb(query, 1);

    if (movies.length === 0) {
      await telegramService.sendMessage(chatId, `❌ No movies found on TMDb for "${query}"`);
      return;
    }

    const message = formatMovieList(movies, 10, `TMDb Results for "${query}"`);
    const { createTmdbListKeyboard } = require('../utils/keyboard');
    const keyboard = createTmdbListKeyboard(movies);

    await telegramService.sendMessage(chatId, message, {
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error searching TMDb:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to search TMDb. Please try again.');
  }
};

/**
 * Handle /watchtmdb command - View TMDb movie details
 */
const handleTmdbWatch = async (msgOrChatId, tmdbId) => {
  const chatId = typeof msgOrChatId === 'object' ? msgOrChatId.chat.id : msgOrChatId;

  if (!tmdbId || isNaN(tmdbId)) {
    await telegramService.sendMessage(chatId, '❌ Please provide a valid TMDb ID.\n\nExample: /watchtmdb 27205');
    return;
  }

  try {
    const movie = await movieService.getTmdbMovieDetails(tmdbId);
    const message = formatMovieMessage(movie);
    const posterUrl = movie.poster_path;
    const { createTmdbMovieKeyboard } = require('../utils/keyboard');
    const keyboard = createTmdbMovieKeyboard(movie);

    if (posterUrl) {
      try {
        await telegramService.sendPhoto(chatId, posterUrl, {
          caption: message,
          reply_markup: keyboard
        });
      } catch (photoError) {
        console.warn('Failed to send photo, falling back to text:', photoError.message);
        await telegramService.sendMessage(chatId, message, {
          reply_markup: keyboard
        });
      }
    } else {
      await telegramService.sendMessage(chatId, message, {
        reply_markup: keyboard
      });
    }
  } catch (error) {
    console.error('Error in handleTmdbWatch:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to load TMDb movie details. Please check the ID and try again.');
  }
};

/**
 * Handle /import command - Multi-step interactive import
 */
const handleImport = async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  if (!query || query.trim() === '') {
    await telegramService.sendMessage(chatId, '❌ Please provide a movie name to search on TMDb.\n\nExample: /import Moana');
    return;
  }

  try {
    await telegramService.sendMessage(chatId, `🔍 Searching TMDb for "${query}"...`);
    const results = await tmdbService.searchTmdb(query);

    if (results.length === 0) {
      await telegramService.sendMessage(chatId, `❌ No movies found on TMDb for "${query}"`);
      return;
    }

    const { createImportResultsKeyboard } = require('../utils/keyboard');
    const keyboard = createImportResultsKeyboard(results);

    await telegramService.sendMessage(chatId, '🎬 *TMDb Search Results:*\nSelect a movie to import:', {
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error in handleImport:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to search TMDb. Please try again.');
  }
};

/**
 * Global message handler for interactive sessions
 */
const handleIncomingMessage = async (msg) => {
  const chatId = msg.chat.id;
  const session = sessionService.getSession(chatId);

  // If there's no active session or it's a command, ignore
  if (!session || (msg.text && msg.text.startsWith('/'))) {
    return;
  }

  const watchUrl = msg.text.trim();
  if (!watchUrl.startsWith('http')) {
    return;
  }

  try {
    if (session.state === 'OPTIONAL_CUSTOM_URL' && session.movieId) {
      await movieService.updateMovieUrl(session.movieId, watchUrl);
      sessionService.clearSession(chatId);
      await telegramService.sendMessage(chatId, `✅ *Watch URL updated!* for movie ID \`${session.movieId}\`.`);
    } else if (session.state === 'AWAITING_WATCH_URL' && session.movieData) {
      const movieData = {
        ...session.movieData,
        watch_url: watchUrl
      };

      const result = await movieService.addMovie(movieData);
      sessionService.clearSession(chatId);
      await telegramService.sendMessage(chatId, `✅ *Success!* Movie imported correctly.\n\n🎬 *${movieData.title}*\nID: \`${result.id}\`\n\nYou can now use \`/post ${result.id}\` to share it!`);
    }
  } catch (error) {
    console.error('Error handling incoming URL:', error);
  }
};

/**
 * Handle /addmovie command
 * Format: /addmovie title|description|year|rating|poster_url|watch_url|trailer_url
 */
const handleAddMovie = async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1];

  if (!input) {
    await telegramService.sendMessage(chatId, '❌ Please provide movie details.\n\nUsage: `/addmovie title|description|year|rating|poster_url|watch_url|trailer_url`');
    return;
  }

  const parts = input.split('|');
  if (parts.length < 6) {
    await telegramService.sendMessage(chatId, '❌ Invalid format. Please provide at least: title, description, year, rating, poster_url, watch_url.');
    return;
  }

  try {
    const movieData = {
      title: parts[0].trim(),
      description: parts[1].trim(),
      year: parseInt(parts[2].trim()),
      rating: parseFloat(parts[3].trim()),
      poster_url: parts[4].trim(),
      watch_url: parts[5].trim(),
      trailer_url: parts[6] ? parts[6].trim() : null
    };

    const result = await movieService.addMovie(movieData);
    await telegramService.sendMessage(chatId, `✅ Movie added successfully! ID: ${result.id}`);
  } catch (error) {
    console.error('Error adding movie:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to add movie. Please check the format and try again.');
  }
};

/**
 * Handle /post command
 */
const handlePost = async (msg, match) => {
  const chatId = msg.chat.id;
  const movieId = match[1];

  if (!movieId || isNaN(movieId)) {
    await telegramService.sendMessage(chatId, '❌ Please provide a valid movie ID.\n\nExample: /post 27205');
    return;
  }

  try {
    await telegramService.sendMessage(chatId, '📤 Posting movie to channel...');
    
    const result = await telegramService.postMovieToChannel(movieId);
    
    await telegramService.sendMessage(
      chatId,
      `✅ Successfully posted *${result.movie.title}* to the channel!`
    );
  } catch (error) {
    await telegramService.sendMessage(chatId, '❌ Failed to post movie. Please check the movie ID and try again.');
  }
};

/**
 * Handle /editurl command
 */
const handleEditUrl = async (msg, match) => {
  const chatId = msg.chat.id;
  const movieId = match[1];
  const newUrl = match[2];

  if (!movieId || isNaN(movieId) || !newUrl) {
    await telegramService.sendMessage(chatId, '❌ Usage: `/editurl <movieId> <newUrl>`\n\nExample: `/editurl 1 https://example.com/movie`');
    return;
  }

  try {
    const success = await movieService.updateMovieUrl(movieId, newUrl);
    if (success) {
      await telegramService.sendMessage(chatId, `✅ Watch URL updated successfully for movie ID: ${movieId}`);
    } else {
      await telegramService.sendMessage(chatId, `❌ Movie with ID ${movieId} not found.`);
    }
  } catch (error) {
    console.error('Error updating movie URL:', error);
    await telegramService.sendMessage(chatId, '❌ Failed to update movie URL.');
  }
};

/**
 * Handle /deletemovie command
 */
const handleDeleteMovie = async (msg, match) => {
  const chatId = msg.chat.id;
  const movieIdStr = match[1];
  const movieId = parseInt(movieIdStr);

  console.log(`/deletemovie command received for ID: ${movieIdStr} (parsed: ${movieId})`);
  logToFile(`/deletemovie command received for ID: ${movieIdStr} (parsed: ${movieId})`);

  if (!movieId || isNaN(movieId)) {
    await telegramService.sendMessage(chatId, '❌ Usage: `/deletemovie <movieId>`\n\nExample: `/deletemovie 1`');
    return;
  }

  try {
    const movie = await movieService.getMovieDetails(movieId);
    const success = await movieService.deleteMovie(movieId);
    console.log(`Delete result for ID ${movieId} (${movie ? movie.title : 'unknown'}): ${success}`);
    logToFile(`Delete result for ID ${movieId} (${movie ? movie.title : 'unknown'}): ${success}`);
    
    if (success) {
      const title = movie ? movie.title : 'Unknown';
      await telegramService.sendMessage(chatId, `✅ Movie *${escapeMarkdown(title)}* (ID ${movieId}) deleted successfully.`);
    } else {
      await telegramService.sendMessage(chatId, `❌ Movie with ID ${movieId} not found.`);
    }
  } catch (error) {
    console.error(`Error deleting movie: ${error.message}`);
    logToFile(`Error deleting movie: ${error.message}\n${error.stack}`);
    await telegramService.sendMessage(chatId, `❌ Failed to delete movie ID ${movieId}. Mention if it exists or check the ID.`);
  }
};

/**
 * Handle /watch command - View movie with watch links
 */
const handleWatch = async (msgOrChatId, movieId) => {
  const chatId = typeof msgOrChatId === 'object' ? msgOrChatId.chat.id : msgOrChatId;

  if (!movieId || isNaN(movieId)) {
    await telegramService.sendMessage(chatId, '❌ Please provide a valid movie ID.\n\nExample: /watch 27205');
    return;
  }

  try {
    const movie = await movieService.getMovieDetails(movieId);
    const message = formatMovieMessage(movie);
    const posterUrl = movieService.getPosterUrl(movie.poster_path);
    const { createMovieKeyboard } = require('../utils/keyboard');
    const keyboard = createMovieKeyboard(movie);

    if (posterUrl) {
      try {
        await telegramService.sendPhoto(chatId, posterUrl, {
          caption: message,
          reply_markup: keyboard
        });
      } catch (photoError) {
        console.warn('Failed to send photo, falling back to text:', photoError.message);
        await telegramService.sendMessage(chatId, message, {
          reply_markup: keyboard
        });
      }
    } else {
      await telegramService.sendMessage(chatId, message, {
        reply_markup: keyboard
      });
    }
  } catch (error) {
    console.error('Error in handleWatch:', error);
    // If it's a Telegram error, it might be due to Markdown
    if (error.response && error.response.body) {
      console.error('Telegram Error Body:', error.response.body);
    }
    await telegramService.sendMessage(chatId, '❌ Failed to load movie details. Please check the movie ID and try again.');
  }
};

/**
 * Callback URL handler
 */
const handleCallbackQuery = async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('watch:')) {
    const movieId = data.split(':')[1];
    await telegramService.sendMessage(chatId, '🎬 Loading movie details...');
    await handleWatch(chatId, movieId);
  } else if (data.startsWith('tmdb_watch:')) {
    const tmdbId = data.split(':')[1];
    await telegramService.sendMessage(chatId, '🎬 Loading TMDb movie details...');
    await handleTmdbWatch(chatId, tmdbId);
  } else if (data.startsWith('tmdb_search:')) {
    const query = data.substring('tmdb_search:'.length);
    await handleTmdbSearch({ chat: { id: chatId } }, [, query]);
  } else if (data.startsWith('import:')) {
    const tmdbId = data.split(':')[1];
    try {
      await telegramService.sendMessage(chatId, '⚙️ Fetching metadata from TMDb and saving to your collection...');
      const details = await tmdbService.getDetails(tmdbId);
      
      const year = details.release_date ? new Date(details.release_date).getFullYear() : null;
      const trailer = details.videos && details.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      
      const movieData = {
        title: details.title,
        description: details.overview,
        year: year ? parseInt(year) : null,
        rating: details.vote_average || 0,
        poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        watch_url: `https://autoembed.co/movie/tmdb/${tmdbId}`,
        trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
      };

      const result = await movieService.addMovie(movieData);
      
      // Store session in case user wants to immediately replace watch URL with a custom link
      sessionService.setSession(chatId, {
        state: 'OPTIONAL_CUSTOM_URL',
        movieId: result.id
      });

      const message = `✅ *Success! Movie Imported to Local Collection*\n\n` +
        `🎬 *${escapeMarkdown(movieData.title)}* (${year || 'N/A'})\n` +
        `🆔 Local ID: \`${result.id}\`\n` +
        `⭐ Rating: ${Number(movieData.rating).toFixed(1)}/10\n` +
        `📺 Stream Link: Configured (Server 1 & 2)\n\n` +
        `👉 Send \`/post ${result.id}\` to post it to your channel!\n` +
        `👉 Send \`/mymovies\` to view your updated list.\n` +
        `👉 (Optional) Reply with any URL starting with \`http://\` to change the watch link.`;

      await telegramService.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error fetching TMDb details for import:', error);
      await telegramService.sendMessage(chatId, '❌ Failed to import movie. Please try again.');
    }
  } else if (data.startsWith('delete:')) {
    const movieIdStr = data.split(':')[1];
    const movieId = parseInt(movieIdStr);
    console.log(`Delete button clicked for ID: ${movieIdStr} (parsed: ${movieId})`);
    logToFile(`Delete button clicked for ID: ${movieIdStr} (parsed: ${movieId})`);
    try {
      const movie = await movieService.getMovieDetails(movieId);
      const success = await movieService.deleteMovie(movieId);
      console.log(`Delete button result for ID ${movieId} (${movie ? movie.title : 'unknown'}): ${success}`);
      logToFile(`Delete button result for ID ${movieId} (${movie ? movie.title : 'unknown'}): ${success}`);
      if (success) {
        const title = movie ? movie.title : 'Unknown';
        await telegramService.sendMessage(chatId, `✅ Movie *${escapeMarkdown(title)}* (ID ${movieId}) deleted successfully.`);
      } else {
        await telegramService.sendMessage(chatId, `❌ Movie with ID ${movieId} not found.`);
      }
    } catch (error) {
      logToFile(`Error in delete callback: ${error.message}\n${error.stack}`);
      await telegramService.sendMessage(chatId, '❌ Failed to delete movie.');
    }
  }

  // Answer callback query to stop loading state in client
  const bot = telegramService.getBot();
  bot.answerCallbackQuery(callbackQuery.id);
};

/**
 * Register all bot commands
 */
const registerCommands = () => {
  const bot = telegramService.getBot();

  bot.onText(/\/start/, handleStart);
  bot.onText(/\/help/, handleHelp);
  bot.onText(/\/mymovies/, handleMyMovies);
  bot.onText(/\/list/, handleMyMovies);
  bot.onText(/\/trending/, handleTrending);
  bot.onText(/\/tmdbtrending/, handleTmdbTrending);
  bot.onText(/\/tmdb (.+)/, handleTmdbSearch);
  bot.onText(/\/watchtmdb (\d+)/, (msg, match) => handleTmdbWatch(msg, match[1]));
  bot.onText(/\/search (.+)/, handleSearch);
  bot.onText(/\/watch (\d+)/, (msg, match) => handleWatch(msg, match[1]));
  bot.onText(/\/addmovie (.+)/, handleAddMovie);
  bot.onText(/\/import (.+)/, handleImport);
  bot.onText(/\/post (\d+)/, handlePost);
  bot.onText(/\/editurl (\d+) (.+)/, handleEditUrl);
  bot.onText(/\/deletemovie (\d+)/, handleDeleteMovie);

  // Handle all incoming messages for interactive sessions
  bot.on('message', handleIncomingMessage);

  // Handle callback queries (button clicks)
  bot.on('callback_query', handleCallbackQuery);

  console.log('✅ Bot commands registered');
};

module.exports = {
  registerCommands,
  handleStart,
  handleHelp,
  handleMyMovies,
  handleTrending,
  handleTmdbTrending,
  handleSearch,
  handleTmdbSearch,
  handleWatch,
  handleTmdbWatch,
  handlePost,
  handleAddMovie,
  handleImport
};

