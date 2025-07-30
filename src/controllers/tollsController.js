const HttpStatus = require('../enums/status.enum');
const TollRoad = require('../models/tollsModel');
const axios = require('axios');
const turf = require('@turf/turf');
const polyline = require('@mapbox/polyline');

const processRoute = async (req, res) => {
  try {
    const { polyline: encodedPolyline, typeCargo } = req.body;

    if (!encodedPolyline) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Se requiere una polyline codificada.' });
    if (!typeCargo) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Se requiere el tipo de carga (typeCargo).' });

    const decoded = polyline.decode(encodedPolyline);
    if (decoded.length < 1) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Se requiere al menos 1 punto en la ruta.' });

    const coordinates = decoded.map(([lat, lng]) => [lng, lat]);
    const costField = `precio_camiones_${typeCargo}_ejes`;

    let line = turf.lineString(coordinates);
    // Simplificar la línea para reducir puntos y mejorar rendimiento
    line = turf.simplify(line, { tolerance: 0.001, highQuality: false });

    const buffer = turf.buffer(line, 0.2, { units: 'kilometers' });

    const tolls = await TollRoad.find({
      location: {
        $geoWithin: { $geometry: buffer.geometry }
      }
    });

    const tollsMapped = tolls.map(toll => ({
      id: toll._id,
      name: toll.via,
      position: [toll.location.coordinates[1], toll.location.coordinates[0]],
      cost: toll[costField] || 0
    }));
    const totalCost = tollsMapped.reduce((sum, toll) => sum + toll.cost, 0);
    return res.json({ tolls: tollsMapped, totalCost });
  } catch (error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};



module.exports = {
  processRoute
};