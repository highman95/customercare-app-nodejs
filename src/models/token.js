const bcrypt = require('bcrypt');
const { dbEntities, generateToken } = require('../utils/helpers');
const { BadRequestError, DatabaseError, InternalServerError, NotAcceptableError } = require('../utils/http-errors');

module.exports = {
    async create(user) {
        if (!user) throw new NotAcceptableError('The authenticated user is missing');

        let hashedPassKey, currentTime = Date.now();
        try {
            hashedPassKey = await bcrypt.hash(`${process.env.PASS_KEY}-${currentTime}`, 10);
        } catch (e) {
            throw new InternalServerError('Token could not be generated');
        }

        try {
            const { id, first_name, email } = user;
            const token = generateToken({ first_name, email, rand: hashedPassKey });

            const millisecondsInElapseTimehours = process.env.JWT_ELAPSE * 60 * 60 * 1000;
            const expires_at = currentTime + millisecondsInElapseTimehours;

            const result = await db.query(`INSERT INTO ${dbEntities.tokens} (user_id, code, expires_at) VALUES ($1, $2, $3) RETURNING expires_at`, [id, hashedPassKey, expires_at]);
            return (result.rowCount === 0) ? null : { ...result.rows[0], token };
        } catch (e) {
            throw new DatabaseError('Token could not be saved');
        }
    },

    findByCode: async (code) => {
        if (!code) throw new BadRequestError('Token checksum is missing');

        const result = await db.query(`SELECT user_id, expires_at ${dbEntities.tokens} WHERE code = $1 LIMIT 1`, [code]);
        return (result.rowCount === 0) ? null : result.rows[0];
    }
}
