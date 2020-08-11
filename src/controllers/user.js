const model = require('../models/user');
const modelToken = require('../models/token');

module.exports = {
    authenticate: async (req, res, next) => {
        const { body: { username, email, password } } = req;

        try {
            const user = await model.authenticate(username || email, password);
            const { token, expires_at } = await modelToken.create(user);
            res.json({ status: true, data: user, auth: { type: 'bearer', token, expires_at } });
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
            res.status(201).json({ status: true, data: user, message: 'User created successfully' });
        } catch (e) {
            next(e);
        }
    },

    activate: async (req, res, next) => {
        const { user_id } = req.body;

        try {
            await model.toggleDisabled(user_id, false);
            res.json({ status: true, message: 'The account has been activated' });
        } catch (e) {
            next(e);
        }
    },

    deactivate: async (req, res, next) => {
        const { user_id } = req.body;

        try {
            await model.toggleDisabled(user_id, true);
            res.json({ status: true, message: 'The account has been de-activated' });
        } catch (e) {
            next(e);
        }
    },

    fetch: async (req, res, next) => {
        const { q } = req.query;

        try {
            const users = await model.fetchAll(q);
            res.json({ status: true, data: users });
        } catch (e) {
            next(e);
        }
    },

    find: async (req, res, next) => {
        const { id } = req.params;

        try {
            const user = await model.find(id);
            delete user.password;
            delete user.attempts;
            delete user.locked;

            res.json({ status: true, data: user });
        } catch (e) {
            next(e);
        }
    },
};
