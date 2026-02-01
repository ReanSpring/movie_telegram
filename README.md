# Movie Telegram Bot API 🎬

A Node.js application that combines an Express REST API with a Telegram bot to fetch movie data from The Movie Database (TMDb) and post it to your Telegram channel.

- 🎥 Store movies in a local SQLite database
- 🔍 Search your custom movie collection
- 📊 Set your own ratings, descriptions, and years
- 🤖 Telegram bot with interactive commands
- 📢 Automatically post movies to your Telegram channel (ad-free)
- 🚀 Skip external movie sites with heavy ads

## Prerequisites

Before you begin, you'll need:

1. **Node.js** (v14 or higher)
2. **TMDb API Key** - Get it for free at [themoviedb.org](https://www.themoviedb.org/settings/api)
3. **Telegram Bot Token** - Create a bot via [@BotFather](https://t.me/botfather)
4. **Telegram Channel** - Create a channel and add your bot as an administrator

## Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd /Users/sunnengsen/Documents/Code/movie_telegram
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file:**

   ```env
   PORT=3000

   TMDB_API_KEY=your_tmdb_api_key_here
   TMDB_BASE_URL=https://api.themoviedb.org/3

   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_CHANNEL_ID=@your_channel_name_or_id
   ```

## Getting Your Credentials

### TMDb API Key

1. Go to [themoviedb.org](https://www.themoviedb.org/)
2. Create an account or log in
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Copy your API key

### Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided

### Telegram Channel ID

1. Create a new channel in Telegram
2. Add your bot as an administrator
3. Use your channel username (e.g., `@my_movie_channel`) or channel ID (e.g., `-1001234567890`)

## Usage

### Start the Application

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:3000` and the Telegram bot will begin polling for messages.

### Telegram Bot Commands

Open a chat with your bot and use these commands:

- `/start` - Welcome message and command list
- `/help` - Show available commands
- `/trending` - Get recently added movies from your local database
- `/search <movie name>` - Search your local collection
- `/addmovie title|description|year|rating|poster_url|watch_url|trailer_url` - Add a new movie
- `/watch <movie id>` - View movie details and buttons
- `/post <movie id>` - Post a movie to your channel

### API Endpoints

#### Get Trending Movies

```bash
GET http://localhost:3000/api/movies/trending
```

**Query Parameters:**

- `page` (optional) - Page number (default: 1)

**Example:**

```bash
curl http://localhost:3000/api/movies/trending?page=1
```

#### Search Movies

```bash
GET http://localhost:3000/api/movies/search?q=inception
```

**Query Parameters:**

- `q` (required) - Search query
- `page` (optional) - Page number (default: 1)

**Example:**

```bash
curl "http://localhost:3000/api/movies/search?q=inception"
```

#### Get Movie Details

```bash
GET http://localhost:3000/api/movies/:id
```

**Example:**

```bash
curl http://localhost:3000/api/movies/27205
```

## Project Structure

```
movie_telegram/
├── src/
│   ├── bot/
│   │   ├── commands.js      # Bot command handlers
│   │   └── index.js         # Bot initialization
│   ├── config/
│   │   └── config.js        # Configuration management
│   ├── controllers/
│   │   └── movieController.js  # API request handlers
│   ├── routes/
│   │   └── movieRoutes.js   # Express routes
│   ├── services/
│   │   ├── movieService.js  # TMDb API integration
│   │   └── telegramService.js  # Telegram bot service
│   └── utils/
│       └── formatters.js    # Message formatting utilities
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
└── server.js               # Application entry point
```

### How to add your own movie:

Send this command to your bot (copy-paste and modify):

```
/addmovie Title|Description|Year|Rating|PosterURL|WatchURL|TrailerURL
```

**Example:**
`/addmovie Inception|A thief who steals corporate secrets...|2010|8.8|https://path-to-poster.jpg|https://your-ad-free-link.com|https://youtube.com/trailer`

1. The bot will automatically use the next available ID.
2. Use `/trending` or `/search` to see your new movie.
3. Use `/post ID` to share it!

## Troubleshooting

### Bot not responding

- Verify your `TELEGRAM_BOT_TOKEN` is correct
- Make sure the bot is not already running in another terminal
- Check the console for error messages

### Movies not posting to channel

- Ensure your bot is added as an administrator to the channel
- Verify the `TELEGRAM_CHANNEL_ID` is correct (use `@` for public channels)
- Check that the bot has permission to post messages

### API errors

- Verify your `TMDB_API_KEY` is valid
- Check your internet connection
- Review the console logs for specific error messages

## License

ISC

## Author

Built with ❤️ for movie lovers
