const model = require('../models/customer');

module.exports = {
    create: async (req, res, next) => {
        const { body: { first_name, last_name, birth_date, gender, email, phone }, user } = req;

        try {
            const customer = await model.create(first_name, last_name, birth_date, gender, email, phone, user.id);
            res.status(201).json({ status: 'success', data: { customer, message: 'Customer created successfully' } });
        } catch (e) {
            next(e)
        }
    },

    fetch: async (req, res, next) => {
        const { q } = req.query;

        try {
            const customers = await model.fetchAll(q);
            res.status(200).json({ status: 'success', data: customers });
        } catch (e) {
            next(e)
        }
    }
}
