const db = require('../db/connection');

async function brandRoutes(fastify) {
  fastify.get('/api/brands', async () => {
    const result = await db.query(`
      SELECT b.id, b.turn14_id, b.name, b.logo_url,
             COUNT(p.id) AS product_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id AND p.active = true
      WHERE b.active = true
      GROUP BY b.id
      ORDER BY b.name`);

    return { data: result.rows };
  });

  fastify.get('/api/brands/:id', async (request, reply) => {
    const { id } = request.params;
    const result = await db.query(`
      SELECT b.*, COUNT(p.id) AS product_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id AND p.active = true
      WHERE b.id = $1
      GROUP BY b.id`, [id]);

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Brand not found' });
    }
    return { data: result.rows[0] };
  });
}

module.exports = brandRoutes;
