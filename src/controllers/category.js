const model = require('../models/category');
const modelProduct = require('../models/product');

module.exports = {
    create: async (req, res, next) => {
        const { body: { name }, user } = req;

        try {
            const category = await model.create(name, user.id);
            res.status(201).json({ status: true, data: { message: 'Category created successfully', category } });
        } catch (e) {
            next(e);
        }
    },

    fetch: async (req, res, next) => {
        const { q } = req.query;

        try {
            const categories = await model.fetchAll(q);
            res.json({ status: true, data: categories });
        } catch (e) {
            next(e);
        }
    },

    find: async (req, res, next) => {
        const { id } = req.params;

        try {
            const category = await model.find(id);
            category.products = await modelProduct.fetchAll(category.id);

            res.json({ status: true, data: category });
        } catch (e) {
            next(e);
        }
    },
};
