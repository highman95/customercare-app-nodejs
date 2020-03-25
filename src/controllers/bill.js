const model = require('../models/bill');

module.exports = {
    create: async (req, res, next) => {
        const { body: { customer_id, phone, address = '', orders = [] }, user } = req;

        try {
            const bill = await model.create(customer_id, phone, address, orders, user.id);
            res.status(201).json({ status: 'success', data: bill });
        } catch (e) {
            next(e)
        }
    },

    fetch: async (req, res, next) => {
        const { q } = req.query;

        try {
            const bills = await model.fetchAll();
            res.status(200).json({ status: 'success', data: bills });
        } catch (e) {
            next(e)
        }
    }
}
