const express = require('express');
const config = require('./src/config/config');
const movieRoutes = require('./src/routes/movieRoutes');
const { startBot } = require('./src/bot');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Movie Telegram Bot API',
    version: '1.0.0',
    endpoints: {
      trending: '/api/movies/trending',
      search: '/api/movies/search?q=query',
      details: '/api/movies/:id'
    }
  });
});

app.use('/api/movies', movieRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start Express server
app.listen(config.port, async () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  
  if (process.env.APP_URL && process.env.APP_URL.includes('loca.lt')) {
    const getPublicIP = require('./src/utils/get-ip');
    await getPublicIP();
  }
});

// Start Telegram bot
startBot();

module.exports = app;
