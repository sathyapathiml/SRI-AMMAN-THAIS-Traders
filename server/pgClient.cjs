const { Pool } = require('pg');

let pool = null;

if (process.env.DATABASE_URL) {
  const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });
  console.log('🐘 PostgreSQL connection pool initialized with DATABASE_URL.');
} else {
  console.log('📁 No DATABASE_URL provided. Falling back to local SQLite database (server/billing.db).');
}

module.exports = { pool };
