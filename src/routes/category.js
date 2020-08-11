const controller = require('../controllers/category');
const { authWare } = require('../utils/middlewares');

module.exports = (router) => {
  router.post('/categories', authWare, controller.create);
  router.get('/categories', controller.fetch);
  router.get('/categories/:id', controller.find);
};
