const { dbEntities } = require('../utils/helpers');
const { BadRequestError, ConflictError, DatabaseError } = require('../utils/http-errors');

module.exports = {
    async create(name, userId) {
        if (!userId) throw new BadRequestError('The user cannot be identified');
        if ((await this.findByName(name)).id) throw new ConflictError('The category-name already exists');

        try {
            const result = await db.query(`INSERT INTO ${dbEntities.categories} (name, user_id) VALUES ($1, $2) RETURNING id, name, extract(epoch from created_at) as created_at`, [name, userId]);
            return result.rows[0] || {};
        } catch (e) {
            throw new DatabaseError('The category could not be saved')
        }
    },

    fetchAll: async (q) => {
        const where = !q ? '' : `AND LOWER(name) LIKE '%${q}%'`;
        const results = await db.query(`SELECT id, name, extract(epoch FROM created_at) as created_at FROM ${dbEntities.categories} WHERE 1 = 1 ${where} ORDER BY name`);
        return results.rows;
    },

    find: async (id) => {
        const result = await db.query(`SELECT id, name, extract(epoch FROM created_at) AS created_at FROM ${dbEntities.categories} WHERE id = $1`, [id]);
        return result.rows[0] || {};
    },

    findByName: async (name) => {
        if (!name || !name.trim()) throw new BadRequestError('The category-name is missing');

        const result = await db.query(`SELECT id, name, extract(epoch from created_at) as created_at FROM ${dbEntities.categories} WHERE LOWER(name) = $1`, [name.trim().toLowerCase()]);
        return result.rows[0] || {};
    }
}