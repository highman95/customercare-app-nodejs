const controller = require('../controllers/item');
const { authWare } = require('../utils/middlewares');

module.exports = (router) => {
    router.post('/category-items', authWare, controller.create);
}
