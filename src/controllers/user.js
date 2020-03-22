const userModel = require('../models/user');
const tokenModel = require('../models/token');

module.exports = {
    authenticate: async (req, res, next) => {
        const { body: { username, password } } = req;

        try {
            const user = await userModel.authenticate(username, password);
            const { token, expires_at } = await tokenModel.create(user);
            res.status(200).json({ status: 'success', data: { user, token, expires_at } });
        } catch (e) {
            next(e)
        }
    },

    create: async (req, res, next) => {
        const { first_name, last_name, gender, address, email, password } = req.body;

        try {
            const user = await userModel.create(first_name, last_name, gender, address, email, password);
            res.status(201).json({ status: 'success', data: { user, message: 'User created successfully' } });
        } catch (e) {
            next(e)
        }
    }
}
