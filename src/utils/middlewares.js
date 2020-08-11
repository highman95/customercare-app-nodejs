const multer = require('multer');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

// #region authentication middleware
const auth = async (req, res, next) => {
    const { authorization = '' } = req.headers;
    const [, token] = authorization.split(' ');
    if (!token || !token.trim()) {
        next(new Error('Token is missing'));
        return;
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findByEmail(decodedToken.email);
        next();
    } catch (e) {
        next(new Error(`Token is ${(e.name === 'TokenExpiredError') ? 'expired' : 'invalid'}`));
    }
};

module.exports.authWare = auth;
// #endregion


// #region multer middleware
const storage = multer.diskStorage({
    // destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}.gif`),
});

const fileFilter = (req, file, cb) => {
    const isProper = ['image/jpeg', 'image/png'].includes(file.mimetype);
    cb(isProper ? null : new Error('Only JPEG/PNG images are acceptable'), isProper);
};

module.exports.multerWare = multer({ storage, fileFilter, limits: { fileSize: 1000000 } });// .single('photo');
// #endregion
