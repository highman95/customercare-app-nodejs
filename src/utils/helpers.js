const jwt = require('jsonwebtoken');
const { BadRequestError } = require('./http-errors');
const { db } = require('./configurations');

module.exports = {
    generateToken: (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: `${process.env.JWT_ELAPSE}h`, subject: 'Cu$t0merCar£-nodeJS' }),

    isValidEmail: (email) => (!!email && /^([a-zA-Z0-9_\-]+)(\.)?([a-zA-Z0-9_\-]+)@([a-zA-Z]+)\.([a-zA-Z]{2,})$/.test(email)),// eslint-disable-line

    validateParameters: (inputParams, paramsToVerify) => {
        Object.entries(inputParams).forEach(([key, value]) => {
            if (!paramsToVerify.includes(key)) throw new BadRequestError(`Invalid Parameter - ${key} - supplied`);
            if (!value || !value.trim()) throw new BadRequestError(`The ${key} is missing`);
        });
    },

    dbEntities: {
        users: 'users',
        tokens: 'tokens',
        categories: 'categories',
        products: 'products',
        customers: 'customers',
        bills: 'bills',
        items: 'items',
        audits: 'audits',
    },

    db,
};
