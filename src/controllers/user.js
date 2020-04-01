const model = require('../models/user');
const modelToken = require('../models/token');

module.exports = {
    authenticate: async (req, res, next) => {
        const { body: { username, password } } = req;

        try {
            const user = await model.authenticate(username, password);
            const { token, expires_at } = await modelToken.create(user);
            res.status(200).json({ status: 'success', data: { ...user, auth: { token, expires_at } } });
        } catch (e) {
            next(e);
        }
    },

    create: async (req, res, next) => {
        const {
            first_name, last_name, gender, address, email, password,
        } = req.body;

        try {
            const user = await model.create(first_name, last_name, gender, address, email, password);
            res.status(201).json({ status: 'success', data: { user, message: 'User created successfully' } });
        } catch (e) {
            next(e);
        }
    },

    activate: async (req, res, next) => {
        const { user_id } = req.body;

        try {
            await model.toggleDisabled(user_id, false);
            res.status(200).json({ status: 'success', data: { message: 'The account has been activated' } });
        } catch (e) {
            next(e);
        }
    },

    deactivate: async (req, res, next) => {
        const { user_id } = req.body;

        try {
            await model.toggleDisabled(user_id, true);
            res.status(200).json({ status: 'success', data: { message: 'The account has been de-activated' } });
        } catch (e) {
            next(e);
        }
    },

    fetch: async (req, res, next) => {
        const { q } = req.query;

        try {
            const users = await model.fetchAll(q);
            res.status(200).json({ status: 'success', data: users });
        } catch (e) {
            next(e);
        }
    },

    find: async (req, res, next) => {
        const { id } = req.params;

        try {
            const user = await model.find(id);
            delete user.password;
            delete user.locked;

            res.status(200).json({ status: 'success', data: user });
        } catch (e) {
            next(e);
        }
    },
};
