const uuid = require('uuid').v4;

const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Kollam',
        description: 'Most beautiful place in the world',
        location: {
            lat: '76.09988',
            lng: '78.63633'
        },
        address: 'Something, somthing P.O.',
        creator: 'u1'
    }
];

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch(err) {
        const error = new HttpError('Something went wrong, could not find place with id.', 500);
        return next(error);
    }

    if (!place) {
        return next(new HttpError('Could not find a place for the provided id.', 404));
    }

    res.json({ place: place.toObject( { getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch(err) {
        const error = new HttpError('Something went wrong, could not find place with the user id.', 500);
        return next(error);
    }

    if (!places || places.length === 0) {
        return next(new HttpError('Could not find places for the provided user id.', 404));
    }

    res.json({ places: places.map(place => place.toObject( { getters: true } )) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch(error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        image: 'https://townplanning.kerala.gov.in/town/wp-content/uploads/2018/12/kollam-2.jpg',
        address,
        location: coordinates,
        creator
    });

    try {
        await createdPlace.save();
    } catch(err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
    }

    res.status(201).json({place: createdPlace});
};

const updatePlace = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({place: updatedPlace});
};

const deletePlace = (req, res, next) => {
    placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find a place for that id.', 404);
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

    res.status(200).json({message: 'Place deleted.'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;