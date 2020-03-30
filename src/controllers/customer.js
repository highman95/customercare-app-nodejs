const model = require('../models/customer');
const modelBill = require('../models/bill');

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
    },

    find: async (req, res, next) => {
        const { id } = req.params;

        try {
            const customer = await model.find(id);
            if (customer.id) customer.bills = await modelBill.fetchAll(customer.id);

            res.status(200).json({ status: 'success', data: customer });
        } catch (e) {
            next(e)
        }
    }
}
