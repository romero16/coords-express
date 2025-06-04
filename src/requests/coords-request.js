const HttpStatus = require('../enums/status.enum');

function saveCoords(req, res, next) {
  const coords = req.body;

  if (!Array.isArray(coords)) {
    return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST,  message: 'El cuerpo debe ser un arreglo de coordenadas' });
  }

  if (coords.length === 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST,  message: 'El arreglo de coordenadas no puede estar vacío' });
  }

  for (const coord of coords) {
    if (
      !Array.isArray(coord) ||
      coord.length !== 2 ||
      typeof coord[0] !== 'number' ||
      typeof coord[1] !== 'number'
    ) {
      return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST,  message: 'Cada coordenada debe ser un array de dos números: [lng, lat]' });
    }

    const [lng, lat] = coord;
   if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Coordenada fuera de rango permitido. Recibido lng: ${lng}, lat: ${lat}`
      });
    }
  }


  


  next();
};


module.exports = {
  saveCoords
};

