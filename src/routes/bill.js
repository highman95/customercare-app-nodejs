const controller = require('../controllers/bill');

module.exports = (router) => {
    router.post('/bills', controller.create);
}
