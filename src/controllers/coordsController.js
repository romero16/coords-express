const coordsService = require('../services/coordsService');
const HttpStatus = require('../enums/status.enum');

const saveCoordsToRoute = async (req, res) => {

  if (req.body.length === 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Debe enviar un arreglo no vacío de coordinates'
    });
  }

  try {
    const resultado = await coordsService.saveCoordsToRoute(req);

    if (resultado != null) {
      req.io.emit('newCoords', resultado);
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
    console.log(error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor'
    });
  }
};

const getRoute = async (req, res) => {
  try {
    const data = await coordsService.getRoute(req);
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