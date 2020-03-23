const { dbEntities } = require('../utils/helpers');
const { BadRequestError, ConflictError, DatabaseError } = require('../utils/http-errors');

module.exports = {
    async create(category_id, name, price, requirements) {
        // if (!price) throw new BadRequestError('The price is missing');
        if (!requirements) throw new BadRequestError('The requirements are missing');
        if (!!await this.findByName(category_id, name)) throw new ConflictError('The product already exists');

        try {
            const returnValues = 'id, name, price, category_id, extract(epoch from created_at) as created_at';
            const result = await db.query(`INSERT INTO ${dbEntities.products} (name, price, requirements, category_id) VALUES ($1, $2, $3, $4) RETURNING ${returnValues}`, [name, price, requirements, category_id]);
            return result.rows[0] || null;
        } catch (e) {
            throw new DatabaseError('The product could not be saved')
        }
    },

    fetchAll: async (category_id, q) => {
        if (!category_id) throw new BadRequestError('The parent-category is missing');
        const where = !q ? '' : `AND LOWER(name) LIKE '%${q}%'`;

        const results = await db.query(`SELECT id, name, price, requirements FROM ${dbEntities.products} WHERE category_id = $1 ${where} ORDER BY name`, [category_id]);
        return results.rows;
    },

    findByName: async (category_id, name) => {
        if (!category_id) throw new BadRequestError('The parent-category is missing');
        if (!name || !name.trim()) throw new BadRequestError('The category-item-name is missing');
        const name_t = name.trim();// trim the string

        const result = await db.query(`SELECT id, name, extract(epoch from created_at) as created_at FROM ${dbEntities.products} WHERE category_id = $1 AND LOWER(name) = $2`, [category_id, name_t.toLowerCase()]);
        return result.rows[0] || null;
    }
}