const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString ? connectionString.trim() : '',
  ssl: connectionString && connectionString.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database pool');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message || err);
});

module.exports = pool;
