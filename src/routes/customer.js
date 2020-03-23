const controller = require('../controllers/customer');

module.exports = (router) => {
    router.post('/customers', controller.create);
}