const multer = require('multer');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

//#region authentication middleware
const auth = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) return next(new Error('Token is missing'));

    let user;
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        user = await userModel.findByEmail(decodedToken.email);
    } catch (e) {
        return next(e)
    }

    req.user = user;
    next();
};

module.exports.authWare = auth;
//#endregion


//#region multer middleware
const storage = multer.diskStorage({
    // destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => {
        cb(null, `capstone-${file.fieldname}-${Date.now()}.gif`);
    },
});

const fileFilter = (req, file, cb) => {
    const isProper = (file.mimetype === 'image/jpeg') || (file.mimetype === 'image/png');
    cb(isProper ? null : new TypeError('Only JPEG/PNG images are acceptable'), isGif);
};

module.exports.multerWare = multer({ storage, fileFilter, limits: { fileSize: 1000000 } });//.single('photo');
//#endregion
