const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authentication failed!');
        }
        const verificationToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { userId: verificationToken.userId };
        next();
    } catch (err) {
        const error = new HttpError('Authorization failed!', 403);
        return next(error);
    }
};