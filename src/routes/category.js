const controller = require('../controllers/category');
const { authWare } = require('../utils/middlewares');

module.exports = (route) => {
    route.post('/categories', authWare, controller.create);
    route.get('/categories', controller.fetch);
}