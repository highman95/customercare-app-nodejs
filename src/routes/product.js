const controller = require('../controllers/product');
const { authWare } = require('../utils/middlewares');

module.exports = (router) => {
    router.post('/products', authWare, controller.create);
};
