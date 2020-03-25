const model = require('../models/bill');
const modelItem = require('../models/item');

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
    },

    find: async (req, res, next) => {
        const { id } = req.params;

        try {
            const bill = await model.find(id);
            if (!!bill) bill.items = await modelItem.fetchAll(bill.id);

            res.status(200).json({ status: 'success', data: bill });
        } catch (e) {
            next(e)
        }
    }
}
