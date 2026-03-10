const db = require('../db/connection');
const turn14 = require('./turn14Api');
const config = require('../config');

async function createSyncLog(syncType) {
  const result = await db.query(
    'INSERT INTO sync_log (sync_type, status) VALUES ($1, $2) RETURNING id',
    [syncType, 'running']
  );
  return result.rows[0].id;
}

async function updateSyncLog(id, data) {
  const sets = [];
  const vals = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    sets.push(`${key} = $${idx}`);
    vals.push(key === 'metadata' ? JSON.stringify(value) : value);
    idx++;
  }
  vals.push(id);
  await db.query(
    `UPDATE sync_log SET ${sets.join(', ')} WHERE id = $${idx}`,
    vals
  );
}

// ─── Brand Sync ─────────────────────────────────────────────
async function syncBrands(logId) {
  const response = await turn14.getBrands();
  const brands = response?.data || response || [];
  let created = 0, updated = 0;

  for (const brand of brands) {
    const t14id = brand.id || brand.attributes?.id;
    const name = brand.attributes?.name || brand.name || '';
    const logo = brand.attributes?.logo || brand.logo_url || null;

    const existing = await db.query('SELECT id FROM brands WHERE turn14_id = $1', [t14id]);
    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE brands SET name = $1, logo_url = $2, updated_at = NOW() WHERE turn14_id = $3',
        [name, logo, t14id]
      );
      updated++;
    } else {
      await db.query(
        'INSERT INTO brands (turn14_id, name, logo_url) VALUES ($1, $2, $3)',
        [t14id, name, logo]
      );
      created++;
    }
  }

  await updateSyncLog(logId, {
    items_processed: brands.length,
    items_created: created,
    items_updated: updated,
  });
  return { created, updated, total: brands.length };
}

// ─── Category Sync (extracted from product data) ────────────
async function syncCategories(logId) {
  try {
    const response = await turn14.getCategories();
    const categories = response?.data || response || [];
    let created = 0, updated = 0;

    for (const cat of categories) {
      const t14id = cat.id || cat.attributes?.id;
      const name = cat.attributes?.name || cat.name || '';
      const parentT14id = cat.attributes?.parent_id || cat.parent_id || null;

      let parentId = null;
      if (parentT14id) {
        const parentRow = await db.query('SELECT id FROM categories WHERE turn14_id = $1', [parentT14id]);
        parentId = parentRow.rows[0]?.id || null;
      }

      const existing = await db.query('SELECT id FROM categories WHERE turn14_id = $1', [t14id]);
      if (existing.rows.length > 0) {
        await db.query(
          'UPDATE categories SET name = $1, parent_id = $2, updated_at = NOW() WHERE turn14_id = $3',
          [name, parentId, t14id]
        );
        updated++;
      } else {
        await db.query(
          'INSERT INTO categories (turn14_id, name, parent_id) VALUES ($1, $2, $3)',
          [t14id, name, parentId]
        );
        created++;
      }
    }

    await updateSyncLog(logId, {
      items_processed: categories.length,
      items_created: created,
      items_updated: updated,
    });
    return { created, updated, total: categories.length };
  } catch (err) {
    console.warn('[Sync] Category endpoint not available, categories will be created from product data:', err.message);
    return { created: 0, updated: 0, total: 0 };
  }
}

async function getOrCreateCategory(catId, catName) {
  if (!catId) return null;
  const existing = await db.query('SELECT id FROM categories WHERE turn14_id = $1', [catId]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  if (!catName) catName = `Category ${catId}`;
  const result = await db.query(
    'INSERT INTO categories (turn14_id, name) VALUES ($1, $2) ON CONFLICT (turn14_id) DO UPDATE SET name = $2 RETURNING id',
    [catId, catName]
  );
  return result.rows[0].id;
}

// ─── Product Catalog Sync (by brand, paginated) ────────────
async function syncCatalog() {
  const logId = await createSyncLog('catalog');
  let totalCreated = 0, totalUpdated = 0, totalFailed = 0, totalProcessed = 0;

  try {
    console.log('[Sync] Starting brand sync...');
    await syncBrands(logId);

    console.log('[Sync] Starting category sync...');
    await syncCategories(logId);

    console.log('[Sync] Starting product catalog sync...');
    const brandsResult = await db.query('SELECT id, turn14_id FROM brands WHERE active = true');
    const brands = brandsResult.rows;

    for (const brand of brands) {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await turn14.getItemsByBrand(brand.turn14_id, page);
          const items = response?.data || [];

          if (items.length === 0) {
            hasMore = false;
            break;
          }

          for (const item of items) {
            try {
              await upsertProduct(item, brand.id);
              totalProcessed++;
            } catch (err) {
              console.error(`[Sync] Failed to upsert product ${item.id}:`, err.message);
              totalFailed++;
            }
          }

          const meta = response?.meta;
          hasMore = meta?.total_pages ? page < meta.total_pages : items.length > 0;
          page++;
        } catch (err) {
          console.error(`[Sync] Brand ${brand.turn14_id} page ${page} failed:`, err.message);
          hasMore = false;
          totalFailed++;
        }
      }
    }

    await updateSyncLog(logId, {
      status: 'completed',
      items_processed: totalProcessed,
      items_created: totalCreated,
      items_updated: totalUpdated,
      items_failed: totalFailed,
      finished_at: new Date().toISOString(),
    });
    console.log(`[Sync] Catalog sync completed. Processed: ${totalProcessed}, Failed: ${totalFailed}`);
  } catch (err) {
    await updateSyncLog(logId, {
      status: 'failed',
      error_message: err.message,
      finished_at: new Date().toISOString(),
    });
    console.error('[Sync] Catalog sync failed:', err);
    throw err;
  }
}

async function upsertProduct(item, localBrandId) {
  const attrs = item.attributes || item;
  const t14id = item.id || attrs.id;
  const partNumber = attrs.part_number || attrs.product_name || '';
  const mfrPartNumber = attrs.mfr_part_number || '';
  const barcode = attrs.barcode || null;
  const name = attrs.product_name || attrs.part_number || '';
  const desc = attrs.short_description || '';
  const longDesc = attrs.description || '';

  let categoryId = null;
  if (attrs.category?.id || attrs.category_id) {
    const catT14id = attrs.category?.id || attrs.category_id;
    const catName = attrs.category?.name || attrs.category_name || null;
    categoryId = await getOrCreateCategory(catT14id, catName);
  }

  const existing = await db.query('SELECT id FROM products WHERE turn14_id = $1', [t14id]);
  if (existing.rows.length > 0) {
    await db.query(`
      UPDATE products SET
        brand_id = $1, category_id = $2, part_number = $3, mfr_part_number = $4,
        barcode = $5, name = $6, short_description = $7, description = $8, updated_at = NOW()
      WHERE turn14_id = $9`,
      [localBrandId, categoryId, partNumber, mfrPartNumber, barcode, name, desc, longDesc, t14id]
    );
    return existing.rows[0].id;
  }

  const result = await db.query(`
    INSERT INTO products (turn14_id, brand_id, category_id, part_number, mfr_part_number, barcode, name, short_description, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [t14id, localBrandId, categoryId, partNumber, mfrPartNumber, barcode, name, desc, longDesc]
  );
  return result.rows[0].id;
}

// ─── Inventory Sync ─────────────────────────────────────────
async function syncInventory() {
  const logId = await createSyncLog('inventory');
  let processed = 0, updated = 0, failed = 0;

  try {
    const productsResult = await db.query('SELECT id, turn14_id FROM products WHERE active = true');
    const products = productsResult.rows;

    for (let i = 0; i < products.length; i += config.sync.batchSize) {
      const batch = products.slice(i, i + config.sync.batchSize);

      for (const product of batch) {
        try {
          const response = await turn14.getItemData(product.turn14_id);
          const data = response?.data?.[0]?.attributes || response?.attributes || {};

          const inventory = data.inventory || {};
          for (const [warehouse, qty] of Object.entries(inventory)) {
            await db.query(`
              INSERT INTO inventory (product_id, warehouse, quantity)
              VALUES ($1, $2, $3)
              ON CONFLICT (product_id, warehouse) DO UPDATE SET quantity = $3, updated_at = NOW()`,
              [product.id, warehouse, parseInt(qty, 10) || 0]
            );
          }

          processed++;
          updated++;
        } catch (err) {
          console.error(`[Sync] Inventory for product ${product.turn14_id} failed:`, err.message);
          failed++;
        }
      }
    }

    await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY product_inventory_totals');

    await updateSyncLog(logId, {
      status: 'completed',
      items_processed: processed,
      items_updated: updated,
      items_failed: failed,
      finished_at: new Date().toISOString(),
    });
    console.log(`[Sync] Inventory sync completed. Processed: ${processed}, Failed: ${failed}`);
  } catch (err) {
    await updateSyncLog(logId, {
      status: 'failed',
      error_message: err.message,
      finished_at: new Date().toISOString(),
    });
    throw err;
  }
}

// ─── Pricing Sync ───────────────────────────────────────────
async function syncPricing() {
  const logId = await createSyncLog('pricing');
  let processed = 0, updated = 0, failed = 0;

  try {
    const productsResult = await db.query('SELECT id, turn14_id FROM products WHERE active = true');
    const products = productsResult.rows;

    for (const product of products) {
      try {
        const response = await turn14.getItemData(product.turn14_id);
        const data = response?.data?.[0]?.attributes || response?.attributes || {};
        const pricing = data.pricing || data;

        await db.query(`
          INSERT INTO product_pricing (product_id, retail_price, jobber_price, map_price, cost, can_purchase)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (product_id) DO UPDATE SET
            retail_price = $2, jobber_price = $3, map_price = $4, cost = $5, can_purchase = $6, updated_at = NOW()`,
          [
            product.id,
            parseFloat(pricing.retail || pricing.pricelist_retail || 0),
            parseFloat(pricing.jobber || pricing.pricelist_jobber || 0),
            parseFloat(pricing.map_price || pricing.pricelist_map || 0),
            parseFloat(pricing.cost || pricing.pricelist_cost || 0),
            pricing.can_purchase !== false,
          ]
        );

        processed++;
        updated++;
      } catch (err) {
        console.error(`[Sync] Pricing for product ${product.turn14_id} failed:`, err.message);
        failed++;
      }
    }

    await updateSyncLog(logId, {
      status: 'completed',
      items_processed: processed,
      items_updated: updated,
      items_failed: failed,
      finished_at: new Date().toISOString(),
    });
    console.log(`[Sync] Pricing sync completed. Processed: ${processed}, Failed: ${failed}`);
  } catch (err) {
    await updateSyncLog(logId, {
      status: 'failed',
      error_message: err.message,
      finished_at: new Date().toISOString(),
    });
    throw err;
  }
}

// ─── Fitment Sync ───────────────────────────────────────────
async function syncFitment() {
  const logId = await createSyncLog('fitment');
  let processed = 0, created = 0, failed = 0;

  try {
    const productsResult = await db.query('SELECT id, turn14_id FROM products WHERE active = true');
    const products = productsResult.rows;

    for (const product of products) {
      try {
        const response = await turn14.getItemFitment(product.turn14_id);
        const fitments = response?.data || response || [];

        if (!Array.isArray(fitments)) continue;

        for (const fit of fitments) {
          const attrs = fit.attributes || fit;
          const year = parseInt(attrs.year, 10);
          const makeName = attrs.make || '';
          const modelName = attrs.model || '';
          const submodelName = attrs.submodel || null;
          const engineName = attrs.engine || null;

          if (!year || !makeName || !modelName) continue;

          const makeId = await getOrCreateVehicleMake(makeName);
          const modelId = await getOrCreateVehicleModel(makeId, modelName);
          const submodelId = submodelName
            ? await getOrCreateVehicleSubmodel(modelId, submodelName)
            : null;
          const engineId = engineName
            ? await getOrCreateVehicleEngine(engineName, attrs)
            : null;

          await db.query(`
            INSERT INTO product_fitment (product_id, year, make_id, model_id, submodel_id, engine_id, qualifier)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (product_id, year, make_id, model_id, COALESCE(submodel_id, 0), COALESCE(engine_id, 0))
            DO NOTHING`,
            [product.id, year, makeId, modelId, submodelId, engineId, attrs.qualifier || null]
          );
          created++;
        }

        processed++;
      } catch (err) {
        console.error(`[Sync] Fitment for product ${product.turn14_id} failed:`, err.message);
        failed++;
      }
    }

    await updateSyncLog(logId, {
      status: 'completed',
      items_processed: processed,
      items_created: created,
      items_failed: failed,
      finished_at: new Date().toISOString(),
    });
    console.log(`[Sync] Fitment sync completed. Products: ${processed}, Fitments: ${created}, Failed: ${failed}`);
  } catch (err) {
    await updateSyncLog(logId, {
      status: 'failed',
      error_message: err.message,
      finished_at: new Date().toISOString(),
    });
    throw err;
  }
}

// ─── Image Sync (runs with catalog) ────────────────────────
async function syncProductImages(productId, turn14Id) {
  try {
    const response = await turn14.getItemData(turn14Id);
    const data = response?.data || [];

    const mediaEntry = Array.isArray(data)
      ? data.find((d) => d.type === 'media' || d.attributes?.media)
      : data;
    const media = mediaEntry?.attributes?.media || mediaEntry?.media || {};
    const images = media.images || media.product_images || [];

    if (!Array.isArray(images)) return;

    await db.query('DELETE FROM product_images WHERE product_id = $1', [productId]);

    for (let i = 0; i < images.length; i++) {
      const img = typeof images[i] === 'string' ? images[i] : images[i]?.url || images[i]?.link;
      if (!img) continue;
      await db.query(
        'INSERT INTO product_images (product_id, url, sort_order, is_primary) VALUES ($1, $2, $3, $4)',
        [productId, img, i, i === 0]
      );
    }
  } catch (err) {
    console.error(`[Sync] Images for product ${turn14Id} failed:`, err.message);
  }
}

// ─── Vehicle Helpers ────────────────────────────────────────
async function getOrCreateVehicleMake(name) {
  const existing = await db.query('SELECT id FROM vehicle_makes WHERE name = $1', [name]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const result = await db.query('INSERT INTO vehicle_makes (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id', [name]);
  return result.rows[0].id;
}

async function getOrCreateVehicleModel(makeId, name) {
  const existing = await db.query('SELECT id FROM vehicle_models WHERE make_id = $1 AND name = $2', [makeId, name]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const result = await db.query('INSERT INTO vehicle_models (make_id, name) VALUES ($1, $2) ON CONFLICT (make_id, name) DO UPDATE SET name = $2 RETURNING id', [makeId, name]);
  return result.rows[0].id;
}

async function getOrCreateVehicleSubmodel(modelId, name) {
  const existing = await db.query('SELECT id FROM vehicle_submodels WHERE model_id = $1 AND name = $2', [modelId, name]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const result = await db.query('INSERT INTO vehicle_submodels (model_id, name) VALUES ($1, $2) ON CONFLICT (model_id, name) DO UPDATE SET name = $2 RETURNING id', [modelId, name]);
  return result.rows[0].id;
}

async function getOrCreateVehicleEngine(name, attrs = {}) {
  const existing = await db.query('SELECT id FROM vehicle_engines WHERE name = $1', [name]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const result = await db.query(
    'INSERT INTO vehicle_engines (name, displacement, block_type, cylinders, fuel_type) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
    [name, attrs.displacement || null, attrs.block_type || null, attrs.cylinders ? parseInt(attrs.cylinders, 10) : null, attrs.fuel_type || null]
  );
  return result.rows[0].id;
}

async function syncBrandsOnly() {
  const logId = await createSyncLog('brands');
  try {
    console.log('[Sync] Starting brand sync...');
    const result = await syncBrands(logId);
    await updateSyncLog(logId, {
      status: 'completed',
      items_processed: result.total,
      items_created: result.created,
      items_updated: result.updated,
      finished_at: new Date().toISOString(),
    });
    console.log(`[Sync] Brands sync completed. Created: ${result.created}, Updated: ${result.updated}, Total: ${result.total}`);
  } catch (err) {
    await updateSyncLog(logId, {
      status: 'failed',
      error_message: err.message,
      finished_at: new Date().toISOString(),
    });
    throw err;
  }
}

module.exports = {
  syncCatalog,
  syncInventory,
  syncPricing,
  syncFitment,
  syncProductImages,
  syncBrandsOnly,
};
