const { dbEntities, validateParameters } = require('../utils/helpers');
const { DatabaseError, NotAcceptableError } = require('../utils/http-errors');

module.exports = {
    async create(firstName, lastName, birthDate, gender, email, phone, userId) {
        const params = ['firstName', 'lastName', 'birthDate', 'gender', 'phone'];
        const submittedInput = { firstName, lastName, birthDate, gender, phone };
        validateParameters(submittedInput, params);

        const genderLcase = gender.toLowerCase();
        if (!['male', 'female'].includes(genderLcase)) throw new NotAcceptableError('The gender can only be male or female');

        try {
            const input = [firstName, lastName, birthDate, genderLcase, email, phone, userId];
            const returnValues = "id, first_name, last_name, phone";

            const result = await db.query(`INSERT INTO ${dbEntities.customers} (first_name, last_name, birth_date, gender, email, phone, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${returnValues}`, input);
            return result.rows[0] || null;
        } catch (e) {
            throw new DatabaseError('Customer could not be saved');
        }
    },
}