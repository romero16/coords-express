const { dbMongo } = require('../config/db');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const tollRoadSchema = new Schema({
  via: { type: String, required: true },
  long_km: { type: Number, default: null },
  vigente_desde: { type: Date, default: null },

  precio_motos: { type: Number, default: null },
  precio_autos: { type: Number, default: null },
  precio_autobuses_2_ejes: { type: Number, default: null },
  precio_autobuses_3_ejes: { type: Number, default: null },
  precio_autobuses_4_ejes: { type: Number, default: null },
  precio_camiones_2_ejes: { type: Number, default: null },
  precio_camiones_3_ejes: { type: Number, default: null },
  precio_camiones_4_ejes: { type: Number, default: null },
  precio_camiones_5_ejes: { type: Number, default: null },
  precio_camiones_6_ejes: { type: Number, default: null },
  precio_camiones_7_ejes: { type: Number, default: null },
  precio_camiones_8_ejes: { type: Number, default: null },
  precio_camiones_9_ejes: { type: Number, default: null },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
      default: undefined
    },
    coordinates: {
      type: [Number],
      required: false,
      default: undefined
    }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Índice 2dsphere para geoespacial
tollRoadSchema.index({ location: '2dsphere' });

// Prevalidate para limpiar location si no es válido
tollRoadSchema.pre('validate', function(next) {
  if (!this.location || 
      !Array.isArray(this.location.coordinates) || 
      this.location.coordinates.length !== 2 ||
      this.location.coordinates.some(coord => typeof coord !== 'number')) {
    this.location = undefined;
  }
  next();
});

// Actualizar updatedAt en cada save
tollRoadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = dbMongo.model('TollRoad', tollRoadSchema);
