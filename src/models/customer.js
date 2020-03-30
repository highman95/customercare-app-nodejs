const { dbEntities, validateParameters } = require('../utils/helpers');
const { DatabaseError, NotAcceptableError, NotFoundError } = require('../utils/http-errors');

module.exports = {
    async create(firstName, lastName, birthDate, gender, email, phone, userId) {
        if (!userId) throw new BadRequestError('Operator is not known');

        const params = ['firstName', 'lastName', 'birthDate', 'gender', 'phone'];
        const submittedInput = { firstName, lastName, birthDate, gender, phone };
        validateParameters(submittedInput, params);

        const genderLcase = gender.toLowerCase();
        if (!['male', 'female'].includes(genderLcase)) throw new NotAcceptableError('The gender can only be male or female');

        try {
            const input = [firstName, lastName, birthDate, genderLcase, email, phone, userId];
            const returnValues = "id, first_name, last_name, phone";

            const result = await db.query(`INSERT INTO ${dbEntities.customers} (first_name, last_name, birth_date, gender, email, phone, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${returnValues}`, input);
            return result.rows[0] || {};
        } catch (e) {
            throw new DatabaseError('Customer could not be saved');
        }
    },

    fetchAll: async (q) => {
        const where = !q ? '' : `AND (LOWER(first_name) LIKE '%${q}%' OR LOWER(last_name) LIKE '%${q}%')`;

        const results = await db.query(`SELECT id, first_name, last_name, gender, email, phone, extract(epoch FROM created_at) as created_at FROM ${dbEntities.customers} WHERE 1 = 1 ${where} ORDER BY last_name`);
        return results.rows;
    },

    find: async (id) => {
        if (!id) throw new NotFoundError('Customer does not exist');

        const result = await db.query(`SELECT id, first_name, last_name, gender, email, phone, extract(epoch from created_at) as created_at FROM ${dbEntities.customers} WHERE id = $1`, [id]);
        return result.rows[0] || {};
    }
}