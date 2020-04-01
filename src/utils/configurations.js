const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;

// #region database configuration
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true',
    idleTimeoutMillis: 30000,
});

// db.on('connect', () => console.log('Connected to database...'));
db.on('error', (e) => console.error(`Cannot connect to database...${e.message}`));
module.exports.db = db;
// #endregion


// #region cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file, callBack) => {
    const options = { resource_type: 'image', folder: 'year-book/users/' };
    return cloudinary.uploader.upload(file, options, callBack);
};
module.exports.uploadImage = uploadImage;
// #endregion
