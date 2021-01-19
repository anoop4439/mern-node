const uuid = require('uuid').v4;
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

let DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Anoop Mohan',
        email: 'test@test.com',
        password: 'testers'
    }
];

const getUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS});
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { name, email, password, places } = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    if(existingUser) {
        const error = new HttpError('User already exists, please login instead.', 422);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password,
        image: 'https://pbs.twimg.com/profile_images/1178196849095630848/b3eDfU0B_400x400.jpg',
        places
    });

    try {
        await createdUser.save();
    } catch(err) {
        const error = new HttpError('Signing up failed, please try again', 500);
        return next(error);
    }

    res.status(201).json({users: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
    const { email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify user, credentials seems to be wrong!', 401);
    }

    res.json({message: 'Logged in'})
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;