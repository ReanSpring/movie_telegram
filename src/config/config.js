require("dotenv").config();

const config = {
  port: process.env.PORT || 3000,

  tmdb: {
    apiKey: process.env.TMDB_API_KEY,
    baseUrl: process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3",
    imageBaseUrl: "https://image.tmdb.org/t/p/w500",
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    channelId: process.env.TELEGRAM_CHANNEL_ID,
  },
  database: {
    path: process.env.DATABASE_PATH || "./data/movies.db",
  },
};

// Validate required environment variables
const validateConfig = () => {
  const required = [
    "TMDB_API_KEY",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHANNEL_ID",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`,
    );
    console.error("Please create a .env file based on .env.example");
    process.exit(1);
  }
};

validateConfig();

module.exports = config;
