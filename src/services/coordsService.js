const Coords = require('../models/coordsModel');

const saveCoords = async (coordsArray) => {
  return await Coords.insertMany(coordsArray);
};

const getAllCoords = async () => {
  return await Coords.find().sort({ timestamp: -1 });
};

module.exports = {
  saveCoords,
  getAllCoords
};

