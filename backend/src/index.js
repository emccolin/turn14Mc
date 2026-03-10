const fastify = require('fastify')({
  logger: {
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
  trustProxy: true,
});

const config = require('./config');
const db = require('./db/connection');
const { startScheduledJobs } = require('./jobs/syncJobs');

async function build() {
  await fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true,
  });

  await fastify.register(require('@fastify/rate-limit'), {
    max: 200,
    timeWindow: '1 minute',
  });

  fastify.get('/api/health', async () => {
    const dbCheck = await db.query('SELECT 1');
    return { status: 'ok', db: dbCheck.rows.length > 0 ? 'connected' : 'error' };
  });

  await fastify.register(require('./routes/products'));
  await fastify.register(require('./routes/brands'));
  await fastify.register(require('./routes/categories'));
  await fastify.register(require('./routes/vehicles'));
  await fastify.register(require('./routes/search'));
  await fastify.register(require('./routes/sync'));

  return fastify;
}

async function start() {
  try {
    const server = await build();
    await server.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Backend running on port ${config.port}`);

    startScheduledJobs();

    const shutdown = async (signal) => {
      console.log(`${signal} received, shutting down...`);
      await server.close();
      await db.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
