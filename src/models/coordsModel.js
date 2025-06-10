const { dbMongo } = require('../config/db');
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  coordinates: [{
    point: {
      type: [Number],
      required: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    }
  }],
  user_id: { type: Number, required: true },
  carrier_id: { type: Number, required: true },
  shipping_id: { type: Number, required: true },
  trip_type: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = dbMongo.model('Route', routeSchema);