const HttpStatus = require('../enums/status.enum');
const RoadRoute = require('../models/roadRoute');
const axios = require('axios');
const turf = require('@turf/turf');
const polyline = require('@mapbox/polyline');


const saveRoadRoute = async (req, res) => {
  try {

    const {coordinates} = req.body;
    const newRoute = new RoadRoute({
      // userId: '64f1a1c2eaf88a4567123abc',
      // name: 'Ruta CDMX a Querétaro',
      route: {
        type: 'LineString',
        coordinates
      }
    });

    const response = await newRoute.save();
    return res.json(response);
  } catch (error) {
    console.error('Error en processRoute:', error);
    return res.status(500).json({ message: error.message });
  }
};


module.exports = {
  saveRoadRoute
};