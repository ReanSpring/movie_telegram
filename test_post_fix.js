const telegramService = require('./src/services/telegramService');
require('dotenv').config();

async function testPost() {
  const movieId = 3; // Moana 2
  console.log(`Testing post for movie ID: ${movieId} with re-added button`);
  
  try {
    const result = await telegramService.postMovieToChannel(movieId);
    console.log('✅ Successfully posted:', result.movie.title);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to post:', error.message);
    process.exit(1);
  }
}

testPost();
