const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placeRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placeRoutes);

app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new Error('Could not find the route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'});
});

mongoose.connect(
'mongodb+srv://<username>:<password>@cluster0.62frb.mongodb.net/<dbname>?retryWrites=true&w=majority'
).then(() => {
    app.listen(5000);
}).catch(err => {
    console.log(err);
});