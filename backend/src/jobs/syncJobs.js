const cron = require('node-cron');
const config = require('../config');
const syncService = require('../services/syncService');

let scheduledJobs = [];

function startScheduledJobs() {
  if (scheduledJobs.length > 0) {
    console.log('[Cron] Jobs already running, skipping...');
    return;
  }

  const catalogJob = cron.schedule(config.sync.catalogCron, async () => {
    console.log('[Cron] Starting catalog sync...');
    try {
      await syncService.syncCatalog();
    } catch (err) {
      console.error('[Cron] Catalog sync failed:', err.message);
    }
  }, { timezone: 'America/New_York' });
  scheduledJobs.push(catalogJob);

  const inventoryJob = cron.schedule(config.sync.inventoryCron, async () => {
    console.log('[Cron] Starting inventory sync...');
    try {
      await syncService.syncInventory();
    } catch (err) {
      console.error('[Cron] Inventory sync failed:', err.message);
    }
  }, { timezone: 'America/New_York' });
  scheduledJobs.push(inventoryJob);

  const pricingJob = cron.schedule(config.sync.pricingCron, async () => {
    console.log('[Cron] Starting pricing sync...');
    try {
      await syncService.syncPricing();
    } catch (err) {
      console.error('[Cron] Pricing sync failed:', err.message);
    }
  }, { timezone: 'America/New_York' });
  scheduledJobs.push(pricingJob);

  const fitmentJob = cron.schedule(config.sync.fitmentCron, async () => {
    console.log('[Cron] Starting fitment sync...');
    try {
      await syncService.syncFitment();
    } catch (err) {
      console.error('[Cron] Fitment sync failed:', err.message);
    }
  }, { timezone: 'America/New_York' });
  scheduledJobs.push(fitmentJob);

  console.log('[Cron] Scheduled jobs:');
  console.log(`  Catalog:   ${config.sync.catalogCron}`);
  console.log(`  Inventory: ${config.sync.inventoryCron}`);
  console.log(`  Pricing:   ${config.sync.pricingCron}`);
  console.log(`  Fitment:   ${config.sync.fitmentCron}`);
}

function stopScheduledJobs() {
  for (const job of scheduledJobs) {
    job.stop();
  }
  scheduledJobs = [];
  console.log('[Cron] All jobs stopped');
}

module.exports = { startScheduledJobs, stopScheduledJobs };
