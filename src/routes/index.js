const userRoutes = require('./user');

module.exports = (router) => {
    userRoutes(router);

    // set a default PING / Health-Check route
    router.get('/ping', (req, res) => res.json({ status: 'success', error: 'connected...pong...pong...pong...' }));

    // set a default route
    router.get('/*', (req, res) => res.status(404).json({ status: 'error', error: 'Page no longer exists' }));
    return router;
}
