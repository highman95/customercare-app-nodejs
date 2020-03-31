const multer = require('multer');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

//#region authentication middleware
const auth = async (req, res, next) => {
    const { token = '' } = req.headers;
    if (!token || !token.trim()) return next(new Error('Token is missing'));

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
        cb(null, `${file.fieldname}-${Date.now()}.gif`);
    },
});

const fileFilter = (req, file, cb) => {
    const isProper = ['image/jpeg', 'image/png'].includes(file.mimetype);
    cb(isProper ? null : new Error('Only JPEG/PNG images are acceptable'), isProper);
};

module.exports.multerWare = multer({ storage, fileFilter, limits: { fileSize: 1000000 } });//.single('photo');
//#endregion
