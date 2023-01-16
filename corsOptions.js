const origins = [
    'https://snmgarage.onrender.com',
    'http://localhost:3000'
]

const corsOrigin = {
    origin: (origin, callback) => {
        if (origins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Unauth by cors'));
        }
    },
    optionsSuccessStatus: 200,
};

module.exports = {
    origins,
    corsOrigin
};