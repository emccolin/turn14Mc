const syncService = require('../services/syncService');
const db = require('../db/connection');

async function syncRoutes(fastify) {
  fastify.post('/api/sync/catalog', async (request, reply) => {
    syncService.syncCatalog().catch((err) => {
      console.error('[Sync] Catalog sync triggered via API failed:', err);
    });
    return { message: 'Catalog sync started in background' };
  });

  fastify.post('/api/sync/inventory', async () => {
    syncService.syncInventory().catch((err) => {
      console.error('[Sync] Inventory sync triggered via API failed:', err);
    });
    return { message: 'Inventory sync started in background' };
  });

  fastify.post('/api/sync/pricing', async () => {
    syncService.syncPricing().catch((err) => {
      console.error('[Sync] Pricing sync triggered via API failed:', err);
    });
    return { message: 'Pricing sync started in background' };
  });

  fastify.post('/api/sync/fitment', async () => {
    syncService.syncFitment().catch((err) => {
      console.error('[Sync] Fitment sync triggered via API failed:', err);
    });
    return { message: 'Fitment sync started in background' };
  });

  fastify.get('/api/sync/status', async () => {
    const result = await db.query(`
      SELECT id, sync_type, status, items_processed, items_created,
             items_updated, items_failed, error_message, started_at, finished_at
      FROM sync_log
      ORDER BY started_at DESC
      LIMIT 20`);
    return { data: result.rows };
  });

  fastify.post('/api/sync/refresh-views', async () => {
    await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY product_inventory_totals');
    return { message: 'Materialized views refreshed' };
  });
}

module.exports = syncRoutes;
