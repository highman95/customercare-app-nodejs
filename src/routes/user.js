const userController = require('../controllers/user');
const { authWare } = require('../utils/middlewares');

module.exports = (router) => {
    router.post('/users/signin', userController.authenticate);
    router.post('/users/register', userController.create);
    router.put('/users/activate', authWare, userController.activate);
    router.put('/users/deactivate', authWare, userController.deactivate);
    router.get('/users', authWare, userController.fetch);
    router.get('/users/:id', authWare, userController.find);
}
