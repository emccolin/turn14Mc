const db = require('../db/connection');
const config = require('../config');

async function searchRoutes(fastify) {
  fastify.get('/api/search', async (request) => {
    const {
      q = '',
      page = 1,
      limit = config.pagination.defaultLimit,
      brand_id,
      category_id,
      year, make_id, model_id,
    } = request.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10), config.pagination.maxLimit);
    const offset = (pageNum - 1) * limitNum;
    const searchTerm = q.trim();

    if (!searchTerm) {
      return { data: [], meta: { page: pageNum, limit: limitNum, total_items: 0, total_pages: 0 } };
    }

    const conditions = ['p.active = true'];
    const params = [];
    let idx = 1;

    conditions.push(`(
      p.name ILIKE $${idx} OR
      p.part_number ILIKE $${idx} OR
      p.mfr_part_number ILIKE $${idx} OR
      p.barcode = $${idx + 1}
    )`);
    params.push(`%${searchTerm}%`, searchTerm);
    idx += 2;

    if (brand_id) {
      conditions.push(`p.brand_id = $${idx++}`);
      params.push(parseInt(brand_id, 10));
    }
    if (category_id) {
      conditions.push(`p.category_id = $${idx++}`);
      params.push(parseInt(category_id, 10));
    }

    let fitmentJoin = '';
    if (year || make_id || model_id) {
      fitmentJoin = 'JOIN product_fitment pf ON pf.product_id = p.id';
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
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countParams = [...params];
    params.push(limitNum, offset);

    const distinctClause = fitmentJoin ? 'DISTINCT' : '';

    const [countResult, dataResult] = await Promise.all([
      db.query(`
        SELECT COUNT(${distinctClause} p.id) FROM products p
        ${fitmentJoin}
        ${where}`, countParams),
      db.query(`
        SELECT ${distinctClause}
          p.id, p.part_number, p.mfr_part_number, p.name, p.short_description,
          b.name AS brand_name, b.id AS brand_id,
          c.name AS category_name,
          pp.retail_price, pp.map_price, pp.can_purchase,
          pit.total_quantity AS stock_quantity,
          (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) AS image_url,
          similarity(p.name, $1) AS relevance
        FROM products p
        ${fitmentJoin}
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN product_pricing pp ON pp.product_id = p.id
        LEFT JOIN product_inventory_totals pit ON pit.product_id = p.id
        ${where}
        ORDER BY relevance DESC, p.name ASC
        LIMIT $${idx++} OFFSET $${idx++}`, params),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: dataResult.rows,
      meta: { page: pageNum, limit: limitNum, total_items: total, total_pages: Math.ceil(total / limitNum) },
    };
  });
}

module.exports = searchRoutes;
