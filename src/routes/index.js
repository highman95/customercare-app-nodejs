const userRoutes = require('./user');
const categoryRoutes = require('./category');
const productRoutes = require('./product');
const customerRoutes = require('./customer');
const billRoutes = require('./bill');
const auditRoutes = require('./audit');

module.exports = (router) => {
    userRoutes(router);
    categoryRoutes(router);
    productRoutes(router);
    customerRoutes(router);
    billRoutes(router);
    auditRoutes(router);

    // set a default PING / Health-Check route
    router.get('/ping', (req, res) => res.json({ status: 'success', error: 'connected...pong...pong...pong...' }));

    // set a default route
    router.get('/*', (req, res) => res.status(404).json({ status: 'error', error: 'Page no longer exists' }));
    return router;
};
