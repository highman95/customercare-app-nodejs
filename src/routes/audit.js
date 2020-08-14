const controller = require('../controllers/audit');
const { authWare } = require('../utils/middlewares');

module.exports = (router) => {
    router.route('/audits/:format?').get(authWare, controller.fetch);
    router.route('/audits/:id').get(authWare, controller.find);
};
