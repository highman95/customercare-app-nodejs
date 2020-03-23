const model = require('../models/product');

module.exports = {
    create: async (req, res, next) => {
        const { body: { name, price, requirements, category_id } } = req;

        try {
            const product = await model.create(category_id, name, price, requirements);
            res.status(201).json({ status: 'success', data: { message: 'Product created successfully', product } });
        } catch (e) {
            next(e)
        }
    }
}