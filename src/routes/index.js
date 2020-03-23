const userRoutes = require('./user');
const categoryRoutes = require('./category');
const itemRoutes = require('./item');

module.exports = (router) => {
    userRoutes(router);
    categoryRoutes(router);
    itemRoutes(router);

    // set a default PING / Health-Check route
    router.get('/ping', (req, res) => res.json({ status: 'success', error: 'connected...pong...pong...pong...' }));

    // set a default route
    router.get('/*', (req, res) => res.status(404).json({ status: 'error', error: 'Page no longer exists' }));
    return router;
}
