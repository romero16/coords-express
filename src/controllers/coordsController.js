const coordsService = require('../services/coordsService');
const HttpStatus = require('../enums/status.enum');

const saveCoordsToRoute = async (req, res) => {

  try {
    const resultado = await coordsService.saveCoordsToRoute(req);
    if (resultado != null) {
      req.io.emit('newCoords', resultado); //para emitir evento de coordenadas guardadas via socket
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Ruta actualizada con nuevas coordenadas',
        data: resultado
      });
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Coordenadas no guardadas, está dentro del rango establecido',
      data: []
    });

  } catch (error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor'
    });
  }
};

const getRoute = async (req, res) => {
  try {
    const data = await coordsService.getRoute(req);
    const exist = Array.isArray(data?.coordinates) && data.coordinates.length > 0;
    
    res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: exist ? 'Datos obtenidos correctamente' : 'No se encontraron registros.',
      data:  exist ? data : []
    });
  } catch (error) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor'
    });
  }
};

const findOne =  async (req, res) => {
    try {
    const data = await coordsService.findOne(req);
    const exist = Array.isArray(data) && data.some(route => Array.isArray(route.coordinates) && route.coordinates.length > 0);

    res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: exist ? 'Datos obtenidos correctamente' : 'No se encontraron registros.',
      data: exist ? data : []
    });
  } catch (error) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor'
    });
  }

};

const getRouteFilter =  async (req, res) => {
    try {
    const data = await coordsService.getRouteFilter(req);
    const exist = Array.isArray(data) && data.some(route => Array.isArray(route.coordinates) && route.coordinates.length > 0);

    res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: exist ? 'Datos obtenidos correctamente' : 'No se encontraron registros.',
      data: exist ? data : []
    });
  } catch (error) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor'
    });
  }

};

module.exports = {
  saveCoordsToRoute,
  getRoute,
  findOne,
  getRouteFilter
};