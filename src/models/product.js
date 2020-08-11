const { dbEntities, db } = require('../utils/helpers');
const {
  BadRequestError, ConflictError, DatabaseError, NotFoundError,
} = require('../utils/http-errors');

module.exports = {
  async create(categoryId, name, price, requirements = '') {
    // if (!price) throw new BadRequestError('The price is missing');
    if (!requirements) throw new BadRequestError('The requirements are missing');
    if ((await this.findByName(categoryId, name)).id) throw new ConflictError('Product already exists');

    try {
      const returnValues = 'id, name, price, category_id, EXTRACT(epoch FROM created_at) as created_at';
      const result = await db.query(`INSERT INTO ${dbEntities.products} (name, price, requirements, category_id) VALUES ($1, $2, $3, $4) RETURNING ${returnValues}`, [name, price, requirements, categoryId]);
      return result.rows[0] || {};
    } catch (e) {
      throw new DatabaseError('The product could not be saved');
    }
  },

  fetchAll: async (categoryId, q) => {
    if (!categoryId) throw new NotFoundError('Category does not exist');
    const where = !q ? '' : `AND LOWER(name) LIKE '%${q}%'`;

    const results = await db.query(`SELECT id, name, price, requirements FROM ${dbEntities.products} WHERE category_id = $1 ${where} ORDER BY name`, [categoryId]);
    return results.rows;
  },

  findByName: async (categoryId, name) => {
    if (!categoryId) throw new NotFoundError('Category does not exist');
    if (!name || !name.trim()) throw new BadRequestError('Product name is missing');

    const result = await db.query(`SELECT id, name, price, EXTRACT(epoch FROM created_at) as created_at FROM ${dbEntities.products} WHERE category_id = $1 AND LOWER(name) = $2`, [categoryId, name.trim().toLowerCase()]);
    return result.rows[0] || {};
  },

  find: async (id) => {
    if (!id) throw new NotFoundError('Product does not exist');

    const result = await db.query(`SELECT id, name, price, EXTRACT(epoch FROM created_at) as created_at FROM ${dbEntities.products} WHERE id = $1`, [id]);
    return result.rows[0] || {};
  },
};
