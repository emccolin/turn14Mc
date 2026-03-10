const db = require('../db/connection');

async function vehicleRoutes(fastify) {
  fastify.get('/api/vehicles/years', async () => {
    const result = await db.query(`
      SELECT DISTINCT year FROM product_fitment
      ORDER BY year DESC`);
    return { data: result.rows.map((r) => r.year) };
  });

  fastify.get('/api/vehicles/makes', async (request) => {
    const { year } = request.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (year) {
      conditions.push(`pf.year = $${idx++}`);
      params.push(parseInt(year, 10));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(`
      SELECT DISTINCT vm.id, vm.name
      FROM vehicle_makes vm
      JOIN product_fitment pf ON pf.make_id = vm.id
      ${where}
      ORDER BY vm.name`, params);

    return { data: result.rows };
  });

  fastify.get('/api/vehicles/models', async (request) => {
    const { year, make_id } = request.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (year) {
      conditions.push(`pf.year = $${idx++}`);
      params.push(parseInt(year, 10));
    }
    if (make_id) {
      conditions.push(`pf.make_id = $${idx++}`);
      params.push(parseInt(make_id, 10));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(`
      SELECT DISTINCT vmod.id, vmod.name
      FROM vehicle_models vmod
      JOIN product_fitment pf ON pf.model_id = vmod.id
      ${where}
      ORDER BY vmod.name`, params);

    return { data: result.rows };
  });

  fastify.get('/api/vehicles/submodels', async (request) => {
    const { year, make_id, model_id } = request.query;
    const conditions = ['pf.submodel_id IS NOT NULL'];
    const params = [];
    let idx = 1;

    if (year) {
      conditions.push(`pf.year = $${idx++}`);
      params.push(parseInt(year, 10));
    }
    if (make_id) {
      conditions.push(`pf.make_id = $${idx++}`);
      params.push(parseInt(make_id, 10));
    }
    if (model_id) {
      conditions.push(`pf.model_id = $${idx++}`);
      params.push(parseInt(model_id, 10));
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const result = await db.query(`
      SELECT DISTINCT vs.id, vs.name
      FROM vehicle_submodels vs
      JOIN product_fitment pf ON pf.submodel_id = vs.id
      ${where}
      ORDER BY vs.name`, params);

    return { data: result.rows };
  });

  fastify.get('/api/vehicles/engines', async (request) => {
    const { year, make_id, model_id, submodel_id } = request.query;
    const conditions = ['pf.engine_id IS NOT NULL'];
    const params = [];
    let idx = 1;

    if (year) {
      conditions.push(`pf.year = $${idx++}`);
      params.push(parseInt(year, 10));
    }
    if (make_id) {
      conditions.push(`pf.make_id = $${idx++}`);
      params.push(parseInt(make_id, 10));
    }
    if (model_id) {
      conditions.push(`pf.model_id = $${idx++}`);
      params.push(parseInt(model_id, 10));
    }
    if (submodel_id) {
      conditions.push(`pf.submodel_id = $${idx++}`);
      params.push(parseInt(submodel_id, 10));
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const result = await db.query(`
      SELECT DISTINCT ve.id, ve.name
      FROM vehicle_engines ve
      JOIN product_fitment pf ON pf.engine_id = ve.id
      ${where}
      ORDER BY ve.name`, params);

    return { data: result.rows };
  });

  fastify.get('/api/vehicles/products', async (request) => {
    const {
      year, make_id, model_id, submodel_id, engine_id,
      brand_id, category_id,
      page = 1, limit = 24, sort = 'name', order = 'asc',
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10) || 24, 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = ['p.active = true'];
    const params = [];
    let idx = 1;

    if (year) {
      conditions.push(`pf.year = $${idx++}`);
      params.push(parseInt(year, 10));
    }
    if (make_id) {
      conditions.push(`pf.make_id = $${idx++}`);
      params.push(parseInt(make_id, 10));
    }
    if (model_id) {
      conditions.push(`pf.model_id = $${idx++}`);
      params.push(parseInt(model_id, 10));
    }
    if (submodel_id) {
      conditions.push(`pf.submodel_id = $${idx++}`);
      params.push(parseInt(submodel_id, 10));
    }
    if (engine_id) {
      conditions.push(`pf.engine_id = $${idx++}`);
      params.push(parseInt(engine_id, 10));
    }
    if (brand_id) {
      conditions.push(`p.brand_id = $${idx++}`);
      params.push(parseInt(brand_id, 10));
    }
    if (category_id) {
      conditions.push(`p.category_id = $${idx++}`);
      params.push(parseInt(category_id, 10));
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSorts = { name: 'p.name', price: 'pp.retail_price', brand: 'b.name' };
    const sortCol = allowedSorts[sort] || 'p.name';
    const sortDir = order === 'desc' ? 'DESC' : 'ASC';

    const countParams = [...params];
    params.push(limitNum, offset);

    const [countResult, dataResult] = await Promise.all([
      db.query(`
        SELECT COUNT(DISTINCT p.id) FROM products p
        JOIN product_fitment pf ON pf.product_id = p.id
        LEFT JOIN product_pricing pp ON pp.product_id = p.id
        LEFT JOIN brands b ON b.id = p.brand_id
        ${where}`, countParams),
      db.query(`
        SELECT DISTINCT ON (p.id)
          p.id, p.part_number, p.mfr_part_number, p.name, p.short_description,
          b.name AS brand_name, b.id AS brand_id, b.logo_url AS brand_logo,
          c.name AS category_name,
          pp.retail_price, pp.map_price, pp.can_purchase,
          pit.total_quantity AS stock_quantity,
          (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) AS image_url
        FROM products p
        JOIN product_fitment pf ON pf.product_id = p.id
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN product_pricing pp ON pp.product_id = p.id
        LEFT JOIN product_inventory_totals pit ON pit.product_id = p.id
        ${where}
        ORDER BY p.id, ${sortCol} ${sortDir}
        LIMIT $${idx++} OFFSET $${idx++}`, params),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: dataResult.rows,
      meta: { page: pageNum, limit: limitNum, total_items: total, total_pages: Math.ceil(total / limitNum) },
    };
  });
}

module.exports = vehicleRoutes;
