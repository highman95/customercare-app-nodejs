const model = require('../models/product');

module.exports = {
    create: async (req, res, next) => {
        const { body: { name, price, requirements, category_id } } = req;

        try {
            const item = await model.create(category_id, name, price, requirements);
            res.status(201).json({ status: 'success', data: { message: 'Category-item created successfully', item } });
        } catch (e) {
            next(e)
        }
    }
}