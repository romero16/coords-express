const mongoose = require('mongoose');

const ModelCoordSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('coord', ModelCoordSchema);
