const { registerCommands } = require('./commands');
const telegramService = require('../services/telegramService');

/**
 * Initialize and start the Telegram bot
 */
const startBot = () => {
  try {
    // Register all commands
    registerCommands();

    const bot = telegramService.getBot();

    // Handle polling errors
    bot.on('polling_error', (error) => {
      console.error('Polling error:', error.message);
    });

    console.log('🤖 Telegram bot is running...');
  } catch (error) {
    console.error('Failed to start bot:', error.message);
    process.exit(1);
  }
};

module.exports = { startBot };
