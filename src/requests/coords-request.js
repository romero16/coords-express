const HttpStatus = require('../enums/status.enum');

function saveCoordsRequest(req, res, next) {
  const coords = req.body;

  if (!Array.isArray(coords)) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'El cuerpo debe ser un arreglo de coordenadas'
    });
  }

  if (coords.length === 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'El arreglo de coordenadas no puede estar vacío'
    });
  }

    // SOLO PARA FORMATO lat y long

for (const coord of coords) {
  if (
    !Array.isArray(coord) ||
    coord.length !== 2 ||
    typeof coord[0] !== 'number' ||
    typeof coord[1] !== 'number'
  ) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Cada coordenada debe ser un array de dos números: [lat, lng]'
    });
  }

  const [lat, lng] = coord;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Coordenada fuera de rango permitido. Recibido lat: ${lat}, lng: ${lng}`
    });
  }
}




  // SOLO PARA FORMATO lng y lat

  // for (const coord of coords) {
  //   if (
  //     !Array.isArray(coord) ||
  //     coord.length !== 2 ||
  //     typeof coord[0] !== 'number' ||
  //     typeof coord[1] !== 'number'
  //   ) {
  //     return res.status(HttpStatus.BAD_REQUEST).json({
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       message: 'Cada coordenada debe ser un array de dos números: [lng, lat]'
  //     });
  //   }

  //   const [lng, lat] = coord;
  //   if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
  //     return res.status(HttpStatus.BAD_REQUEST).json({
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       message: `Coordenada fuera de rango permitido. Recibido lng: ${lng}, lat: ${lat}`
  //     });
  //   }
  // }

  next();
}

function findOneCoordsRequest(req, res, next) {

  const {carrier_id, shipping_id, trip_type } = req.params;

  if (!carrier_id || !shipping_id || !trip_type) {
     return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST,  message: 'Todos los filtros (carrier_id, shipping_id, trip_type) son obligatorios.' });
  }

  const params = [carrier_id, shipping_id, trip_type];
  const allNumbers = params.every(param => /^\d+$/.test(param));

  if (!allNumbers) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Todos los filtros deben ser números enteros positivos.'
    });
  }
  next();
}

module.exports = {
  saveCoordsRequest,
  findOneCoordsRequest
};
