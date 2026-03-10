const db = require('../db/connection');

async function categoryRoutes(fastify) {
  fastify.get('/api/categories', async () => {
    const result = await db.query(`
      SELECT c.id, c.turn14_id, c.name, c.parent_id,
             COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.active = true
      WHERE c.active = true
      GROUP BY c.id
      ORDER BY c.name`);

    return { data: result.rows };
  });

  fastify.get('/api/categories/tree', async () => {
    const result = await db.query(`
      SELECT c.id, c.name, c.parent_id, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.active = true
      WHERE c.active = true
      GROUP BY c.id
      ORDER BY c.name`);

    const categories = result.rows;
    const map = new Map();
    const roots = [];

    for (const cat of categories) {
      cat.children = [];
      map.set(cat.id, cat);
    }
    for (const cat of categories) {
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id).children.push(cat);
      } else {
        roots.push(cat);
      }
    }

    return { data: roots };
  });
}

module.exports = categoryRoutes;
