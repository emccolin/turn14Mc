const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.db.connectionString,
  ...config.db.pool,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

const db = {
  query: (text, params) => pool.query(text, params),

  getClient: () => pool.connect(),

  transaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  close: () => pool.end(),
};

module.exports = db;
