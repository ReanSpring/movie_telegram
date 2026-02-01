const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../data/movies.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Create movies table
db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        year INTEGER,
        rating REAL,
        poster_url TEXT,
        watch_url TEXT NOT NULL,
        trailer_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('✅ Database initialized at', dbPath);

module.exports = db;
