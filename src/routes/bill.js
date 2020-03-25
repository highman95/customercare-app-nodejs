const controller = require('../controllers/bill');
const { authWare } = require('../utils/middlewares');

module.exports = (router) => {
    router.post('/bills', authWare, controller.create);
    router.get('/bills', authWare, controller.fetch);
}
