const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    connectionString: process.env.DATABASE_URL ||
      'postgresql://turn14user:change_this_strong_password@localhost:5432/turn14catalog',
    pool: { min: 2, max: 20, idleTimeoutMillis: 30000 },
  },

  turn14: {
    clientId: process.env.TURN14_CLIENT_ID || '',
    clientSecret: process.env.TURN14_CLIENT_SECRET || '',
    apiBase: process.env.TURN14_API_BASE || 'https://api.turn14.com/v1',
    env: process.env.TURN14_ENV || 'production',
    rateLimit: {
      requestsPerSecond: 4,
      requestsPerHour: 4500,
      requestsPerDay: 28000,
      tokenRequestsPerMinute: 8,
    },
    tokenRefreshMinutes: 45,
  },

  sync: {
    catalogCron: process.env.SYNC_CRON_CATALOG || '0 2 * * *',
    inventoryCron: process.env.SYNC_CRON_INVENTORY || '*/30 * * * *',
    pricingCron: process.env.SYNC_CRON_PRICING || '0 */4 * * *',
    fitmentCron: process.env.SYNC_CRON_FITMENT || '0 3 * * 0',
    batchSize: 100,
    pageSize: 25,
  },

  pagination: {
    defaultLimit: 24,
    maxLimit: 100,
  },
};

module.exports = config;
