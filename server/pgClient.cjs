const { Pool } = require('pg');

// Expect DATABASE_URL env var (e.g., postgres://user:pass@host:5432/dbname)
// Provide a fallback for local development if DATABASE_URL is not set.
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/billing';
const pool = new Pool({
  connectionString,
  // optional: increase pool size, timeouts, etc.
});

module.exports = { pool };
