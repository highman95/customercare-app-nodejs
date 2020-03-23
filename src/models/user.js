const bcrypt = require('bcrypt');
const { dbEntities, isValidEmail, validateParameters } = require('../utils/helpers');
const { BadRequestError, ConflictError, DatabaseError, NotAcceptableError, UnauthorizedError } = require('../utils/http-errors');

module.exports = {
    async authenticate(username, password) {
        if (!password) throw new BadRequestError('Password is missing');

        try {
            const user = await this.findByEmail(username);
            if (!user) throw new Error('E-mail address does not exist');

            const same = await bcrypt.compare(password, user.password);
            if (!same) throw new Error('Password is incorrect');

            if (user.disabled) throw new Error('Your account is NOT active');
            return user;
        } catch (e) {
            throw new UnauthorizedError('Invalid username / password');
        }
    },

    async create(firstName, lastName, gender, address, email, password) {
        const params = ['firstName', 'lastName', 'gender', 'email', 'password', 'address'];
        const submittedInput = { firstName, lastName, gender, email, password, address };
        validateParameters(submittedInput, params);

        const genderLcase = gender.toLowerCase();
        if (!['male', 'female'].includes(genderLcase)) throw new NotAcceptableError('The gender can only be male or female');

        if (!!await this.findByEmail(email)) throw new ConflictError('E-mail address already exists');

        //encrypt the password and compute input parameters
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (e) {
            throw new Error('The password could not be encrypted');
        }

        try {
            const input = [firstName, lastName, genderLcase, email, hashedPassword, address, 2];
            const result = await db.query(`INSERT INTO ${dbEntities.users} (first_name, last_name, gender, email, password, address, cadre_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, email`, input)
            return (result.rowCount === 0) ? null : result.rows[0];
        } catch (e) {
            throw new DatabaseError('User could not be saved');
        }
    },

    async toggleDisabled(userId, disabled) {
        if (!userId) throw new BadRequestError('The user information is missing');

        try {
            const result = await db.query(`UPDATE ${dbEntities.users} SET disabled = $1 WHERE id = $2 RETURNING id`, [disabled, userId]);
            return (result.rowCount === 0) ? null : result.rows[0];
        } catch (e) {
            throw new DatabaseError(`The account could not be ${disabled ? 'de-' : ''}activated`)
        }
    },

    fetchAll: async (q) => {
        const where = !q ? '' : `AND (LOWER(first_name) LIKE %${q}% OR LOWER(last_name) LIKE %${q}%)`;
        const results = await db.query(`SELECT id, first_name, last_name, email, gender, phone, disabled, extract(epoch FROM created_at) as created_at FROM ${dbEntities.users} WHERE 1 = 1 ${where} ORDER BY last_name`, []);
        return results.rows;
    },

    findByEmail: async (email) => {
        if (!isValidEmail(email)) throw new BadRequestError('E-mail address format is invalid');

        const result = await db.query(`SELECT id, first_name, last_name, email, gender, phone, disabled, locked, extract(epoch FROM created_at) as created_at FROM ${dbEntities.users} WHERE email = $1`, [email]);
        return (result.rowCount === 0) ? null : result.rows[0];
    }
}
