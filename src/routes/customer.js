const controller = require('../controllers/customer');
const { authWare } = require('../utils/middlewares');

module.exports = (router) => {
    router.post('/customers', authWare, controller.create);
    router.get('/customers', authWare, controller.fetch);
}