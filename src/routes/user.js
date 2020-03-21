const userController = require('../controllers/user');

module.exports = (router) => {
    router.post('/users/signin', userController.authenticate);
}
