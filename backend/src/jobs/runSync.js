const syncService = require('../services/syncService');
const db = require('../db/connection');

const command = process.argv[2];

const commands = {
  catalog: syncService.syncCatalog,
  inventory: syncService.syncInventory,
  pricing: syncService.syncPricing,
  fitment: syncService.syncFitment,
  'refresh-views': async () => {
    await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY product_inventory_totals');
    console.log('Materialized views refreshed');
  },
};

async function run() {
  const fn = commands[command];
  if (!fn) {
    console.error(`Unknown command: ${command}`);
    console.error(`Available: ${Object.keys(commands).join(', ')}`);
    process.exit(1);
  }

  console.log(`Running sync: ${command}...`);
  try {
    await fn();
    console.log(`Sync ${command} completed successfully`);
  } catch (err) {
    console.error(`Sync ${command} failed:`, err);
    process.exit(1);
  } finally {
    await db.close();
  }
}

run();
