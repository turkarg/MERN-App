const fs = require('fs');
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Error : " + error, 500));
  }

  if (!place) {
    throw new HttpError("Place not found for place id!", 404);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (error) {
    return next(new HttpError("Error : " + error, 500));
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    throw new HttpError("Places not found for user id!", 404);
  }
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid Input!", 422));
  }

  const { title, description, coordinates, address } = req.body;

  const createdPlace = new Place({
    title,
    description,
    location: {
          lat: 40.7484405,
          lng: -73.9878584
        },
    address,
    image:
      req.file.path.replace(/\\/g, '/'),
    creator:req.userData.userId
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    return next(new HttpError("Something went wrong!", 500));
  }

  if (!user) {
    return next(new HttpError("User does not exist!", 500));
  }

  console.log(user.places);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Places creation failed!" + err, 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid Input data!", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Error : " + error, 500));
  }

  if(place.creator.toString() !== req.userData.userId){
    return next(new HttpError("You are not authorized! ", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(new HttpError("Could not update data! " + error, 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  // try {
  //   place = await Place.findById(placeId);
  // } catch (error) {
  //   return next(new HttpError('Something went wrong! : '+error,500));
  // }
  // const placeExist = DUMMY_PLACES.find(p => p.id === placeId);
  // if(!placeExist){
  //     throw new HttpError('Places does not exist!', 404);
  // }
  // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong! Could not delete. " + error, 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could find place for Id! Could not delete. ", 404)
    );
  }

  const imagePath = place.image;

  if(place.creator.id !== req.userData.userId){
    return next(new HttpError("You are not authorized! ", 401));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Places creation failed!" + err, 500);
    return next(error);
  }
  fs.unlink(imagePath, (err) => {
              console.log(err);
          });
  res.status(200).json({ message: "Deleted Successfully" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
