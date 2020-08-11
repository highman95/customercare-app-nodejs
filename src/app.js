const path = require('path');
const express = require('express');
const compression = require('compression');
// const hbs = require('hbs');
const routes = require('./routes');

const app = express();
app.use(compression());


// handle CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, token');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE, PATCH');
    next();
});


// parse request data to JSON object
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// set up handlebars engine and view location
app.set('view engine', 'hbs');// .set('views', path.join(__dirname, '../templates/views'));
// hbs.registerPartials(path.join(__dirname, '../templates/partials'))


app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/v1', routes(express.Router()), (err, req, res, next) => {// eslint-disable-line
    console.log(`${err.name || err.error.name} --- ${err.message || err.error.message}`);
    if (res.headersSent) return next(err);

    const messageParts = err.message.toLowerCase().split(' ');
    const isTAE = messageParts.includes('token') && (['missing', 'invalid', 'expired'].findIndex((m) => messageParts.includes(m)) !== -1);
    const isCSE = ['EvalError', 'Error'].includes(err.name);
    res.status(err.statusCode || (isTAE ? 401 : (isCSE ? 400 : 500))).send({ status: false, error: err.message || err.error.message });// eslint-disable-line no-nested-ternary
});


module.exports = app;
