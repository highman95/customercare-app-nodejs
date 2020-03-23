const categoryModel = require('../models/category');

module.exports = {
    create: async (req, res, next) => {
        const { body: { name }, user } = req;        

        try {
            const category = await categoryModel.create(name, user.id);
            res.status(201).json({ status: 'success', data: { message: 'Category created successfully', category } });
        } catch (e) {
            next(e)
        }
    }
}