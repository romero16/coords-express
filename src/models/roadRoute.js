const { dbMongo } = require('../config/db');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const roadRouteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: false, ref: 'User' },

  name: { type: String, required: false },
  description: { type: String, required: false },

  route: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
      default: 'LineString'
    },
    coordinates: {
      type: [[Number]],
      required: true
    }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Geospatial index
roadRouteSchema.index({ route: '2dsphere' });

// Update timestamp
roadRouteSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = dbMongo.model('roadRoute', roadRouteSchema);
