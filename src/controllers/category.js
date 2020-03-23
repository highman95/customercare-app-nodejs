const model = require('../models/category');

module.exports = {
    create: async (req, res, next) => {
        const { body: { name }, user } = req;

        try {
            const category = await model.create(name, user.id);
            res.status(201).json({ status: 'success', data: { message: 'Category created successfully', category } });
        } catch (e) {
            next(e)
        }
    },

    fetch: async (req, res, next) => {
        const { q } = req.query;

        try {
            const categories = await model.fetchAll(q);
            res.status(200).json({ status: 'success', data: categories });
        } catch (e) {
            next(e)
        }
    }
}