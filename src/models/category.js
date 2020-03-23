const { dbEntities } = require('../utils/helpers');
const { BadRequestError, ConflictError, DatabaseError } = require('../utils/http-errors');

module.exports = {
    async create(name, user_id) {
        if (!user_id) throw new BadRequestError('The user cannot be identified');
        if (!!await this.findByName(name)) throw new ConflictError('The category-name already exists');

        try {
            const result = await db.query(`INSERT INTO ${dbEntities.categories} (name, user_id) VALUES ($1, $2) RETURNING id, name, extract(epoch from created_at) as created_at`, [name, user_id]);
            return result.rows[0] || null;
        } catch (e) {
            throw new DatabaseError('The category could not be saved')
        }
    },

    findByName: async (name) => {
        if (!name || !name.trim()) throw new BadRequestError('The category-name is missing');
        const name_t = name.trim();// trim the string

        const result = await db.query(`SELECT id, name, extract(epoch from created_at) as created_at FROM ${dbEntities.categories} WHERE LOWER(name) = $1`, [name_t.toLowerCase()]);
        return result.rows[0] || null;
    }
}