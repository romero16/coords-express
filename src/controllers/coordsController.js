const coordsService = require('../services/coordsService');
const HttpStatus = require('../enums/status.enum');

const saveCoordsToRoute = async (req, res) => {
  const { driverId, coordinates } = req.body;

  if (!driverId || !Array.isArray(coordinates) || coordinates.length === 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Debe enviar driverId y un arreglo no vacío de coordinates'
    });
  }

  try {
    const resultado = await coordsService.saveCoordsToRoute(driverId, coordinates);
    req.io.emit('newCoords', resultado);
    res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      message: 'Ruta actualizada con nuevas coordenadas',
      data: resultado
    });
  } catch (error) {
    console.log(error.message);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor'
    });
  }
};

const getRoute = async (req, res) => {
  try {
    const data = await coordsService.getRoute(req.params.driverId);
    res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: data.length > 0 && data[0].path?.coordinates?.length > 0 ? 'Datos obtenidos correctamente' : 'No se encontraron registros.',
      data:  data.length > 0 && data[0].path?.coordinates?.length > 0 ? data : []
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
  getRoute
};