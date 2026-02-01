const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');
const movieService = require('./movieService');
const { formatMovieMessage } = require('../utils/formatters');

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: true });
    this.channelId = config.telegram.channelId;
    console.log(`📡 Bot initialized. Channel ID: ${this.channelId}`);
  }

  /**
   * Get the bot instance
   */
  getBot() {
    return this.bot;
  }

  /**
   * Post a movie to the Telegram channel
   */
  async postMovieToChannel(movieId) {
    try {
      const movie = await movieService.getMovieDetails(movieId);
      const message = formatMovieMessage(movie);
      const posterUrl = movieService.getPosterUrl(movie.poster_path);
      const { createChannelPostKeyboard } = require('../utils/keyboard');
      const keyboard = createChannelPostKeyboard(movie);

      if (posterUrl) {
        try {
          await this.bot.sendPhoto(this.channelId, posterUrl, {
            caption: message,
            parse_mode: 'Markdown',
            reply_markup: keyboard
          });
        } catch (photoError) {
          console.warn('Failed to send photo to channel, falling back to text:', photoError.message);
          await this.bot.sendMessage(this.channelId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
          });
        }
      } else {
        await this.bot.sendMessage(this.channelId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
      }

      return { success: true, movie };
    } catch (error) {
      console.error('Error posting to channel:', error.message);
      throw new Error('Failed to post movie to channel');
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId, text, options = {}) {
    try {
      return await this.bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        ...options
      });
    } catch (error) {
      console.error('Error sending message:', error.message);
      throw error;
    }
  }

  /**
   * Send a photo to a chat
   */
  async sendPhoto(chatId, photo, options = {}) {
    try {
      return await this.bot.sendPhoto(chatId, photo, {
        parse_mode: 'Markdown',
        ...options
      });
    } catch (error) {
      console.error('Error sending photo:', error.message);
      throw error;
    }
  }
}

module.exports = new TelegramService();
