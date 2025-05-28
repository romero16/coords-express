const { dbGeoApi } = require('../config/db');
const mongoose = require('mongoose');

const coordSchema  = new mongoose.Schema({
  lat: Number,
  lng: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = dbGeoApi.model('Coord', coordSchema);
