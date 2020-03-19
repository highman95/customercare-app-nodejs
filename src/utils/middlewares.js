const multer = require('multer');
const jwt = require('jsonwebtoken');

//#region authentication middleware
const auth = (req, res, next) => {
    const { token } = req.headers;
    if (!!token) return next(new Error('Token is missing'))

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (req.body.userId && req.body.userId !== decodedToken.userId) {
        return next(new Error('Token verification failed'));
    }

    req.userId = decodedToken.userId;
    next();
};

module.exports.auth = auth;
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

module.exports.multer = multer({ storage, fileFilter, limits: { fileSize: 1000000 } });//.single('photo');
//#endregion
