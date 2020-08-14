require('dotenv').config();

const app = require('./app');

const server = app.listen(process.env.PORT || 3000, (error) => {
    console.log(error ? `Error: ${error.message}...` : `Listening on PORT: ${server.address().port}`);
}).on('error', (error) => {
    const report = (error.code === 'EADDRINUSE') ? `The port [${process.env.PORT || 3000}] is in use` : undefined;
    console.log(report || `${error.name} --- ${error.message}`);// eslint-disable-line no-console
});

module.exports = server;
