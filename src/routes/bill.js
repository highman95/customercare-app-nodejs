const controller = require('../controllers/bill');
const { authWare } = require('../utils/middlewares');

module.exports = (router) => {
  router.post('/bills', authWare, controller.create);
  router.get('/bills', authWare, controller.fetch);
  router.get('/bills/:id', authWare, controller.find);
  router.put('/bills/:id', authWare, controller.editStatus);
};
