const { dbMongo } = require('../config/db');
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  path: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]],
      required: true,
    }
  },
  user_id: {
    type: Number,
    required: true,
  },
    carrier_id: {
    type: Number,
    required: true,
  },
    shipping_id: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

routeSchema.index({ path: '2dsphere' });

module.exports = dbMongo.model('Route', routeSchema);

