const db = require('../db/connection');
const config = require('../config');

async function productRoutes(fastify) {
  fastify.get('/api/products', async (request, reply) => {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      brand_id,
      category_id,
      in_stock,
      sort = 'name',
      order = 'asc',
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10), config.pagination.maxLimit);
    const offset = (pageNum - 1) * limitNum;

    const conditions = ['p.active = true'];
    const params = [];
    let paramIdx = 1;

    if (brand_id) {
      conditions.push(`p.brand_id = $${paramIdx++}`);
      params.push(parseInt(brand_id, 10));
    }
    if (category_id) {
      conditions.push(`p.category_id = $${paramIdx++}`);
      params.push(parseInt(category_id, 10));
    }
    if (in_stock === 'true') {
      conditions.push(`pit.total_quantity > 0`);
    }

    const allowedSorts = { name: 'p.name', price: 'pp.retail_price', brand: 'b.name', newest: 'p.created_at' };
    const sortCol = allowedSorts[sort] || 'p.name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) FROM products p
      LEFT JOIN product_inventory_totals pit ON pit.product_id = p.id
      ${whereClause}`;

    const dataQuery = `
      SELECT
        p.id, p.turn14_id, p.part_number, p.mfr_part_number, p.name,
        p.short_description, p.barcode,
        b.name AS brand_name, b.id AS brand_id, b.logo_url AS brand_logo,
        c.name AS category_name, c.id AS category_id,
        pp.retail_price, pp.map_price, pp.jobber_price, pp.can_purchase,
        pit.total_quantity AS stock_quantity,
        (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) AS image_url
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_pricing pp ON pp.product_id = p.id
      LEFT JOIN product_inventory_totals pit ON pit.product_id = p.id
      ${whereClause}
      ORDER BY ${sortCol} ${sortOrder}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;

    const countParams = [...params];
    params.push(limitNum, offset);

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, countParams),
      db.query(dataQuery, params),
    ]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      data: dataResult.rows,
      meta: {
        page: pageNum,
        limit: limitNum,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  });

  fastify.get('/api/products/:id', async (request, reply) => {
    const { id } = request.params;

    const result = await db.query(`
      SELECT
        p.*,
        b.name AS brand_name, b.logo_url AS brand_logo,
        c.name AS category_name,
        pp.retail_price, pp.map_price, pp.jobber_price, pp.cost, pp.can_purchase,
        pit.total_quantity AS stock_quantity
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_pricing pp ON pp.product_id = p.id
      LEFT JOIN product_inventory_totals pit ON pit.product_id = p.id
      WHERE p.id = $1`, [id]);

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Product not found' });
    }

    const product = result.rows[0];

    const [imagesResult, fitmentResult, inventoryResult] = await Promise.all([
      db.query('SELECT url, sort_order, is_primary FROM product_images WHERE product_id = $1 ORDER BY sort_order', [id]),
      db.query(`
        SELECT pf.year, vm.name AS make, vmod.name AS model,
               vs.name AS submodel, ve.name AS engine
        FROM product_fitment pf
        JOIN vehicle_makes vm ON vm.id = pf.make_id
        JOIN vehicle_models vmod ON vmod.id = pf.model_id
        LEFT JOIN vehicle_submodels vs ON vs.id = pf.submodel_id
        LEFT JOIN vehicle_engines ve ON ve.id = pf.engine_id
        WHERE pf.product_id = $1
        ORDER BY pf.year DESC, vm.name, vmod.name`, [id]),
      db.query('SELECT warehouse, quantity FROM inventory WHERE product_id = $1 AND quantity > 0', [id]),
    ]);

    return {
      data: {
        ...product,
        images: imagesResult.rows,
        fitment: fitmentResult.rows,
        inventory: inventoryResult.rows,
      },
    };
  });
}

module.exports = productRoutes;
