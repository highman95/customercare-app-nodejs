const { dbEntities, isValidEmail } = require('../utils/helpers');
const { BadRequestError, UnauthorizedError } = require('../utils/http-errors');

module.exports = {
    async authenticate(username, password) {
        if (!password) throw new BadRequestError('Password is missing');

        try {
            const user = await this.findByEmail(username);
            if (!user) throw new Error('E-mail address does not exist');

            const same = await bcrypt.compare(password, user.passw0rd);
            if (!same) throw new Error('Password is incorrect');
            return user;
        } catch (e) {
            throw new UnauthorizedError('Invalid username / password');
        }
    },

    findByEmail: async (email) => {
        if (!isValidEmail(email)) throw new BadRequestError('E-mail address format is invalid');

        const result = await db.query(`SELECT * FROM ${dbEntities.users} WHERE email = $1`, [email]);
        return (result.rowCount === 0) ? null : result.rows[0];
    }
}
