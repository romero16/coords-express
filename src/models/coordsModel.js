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
  driver: {
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

