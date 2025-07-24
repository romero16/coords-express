const coordsService = require('../services/coordsService');
const HttpStatus = require('../enums/status.enum');
const socketStore = require('../socketStorage');
const redisClient = require('../config/redis');

const saveCoordsToRoute = async (req, res) => {

  try {
    const resultado = await coordsService.saveCoordsToRoute(req);
          const sessionIds = socketStore.getAllSessionIds();
    const { carrier_id, shipping_id, trip_type} = req.user;
    if (resultado != null) {
 
      
      for (const sessionId of sessionIds) {
        const redisKey = `session:${sessionId}`;
        const cachedSession = await redisClient.get(redisKey);
        if (cachedSession) {
            const chanel = `session_${sessionId}_coords_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
            req.io.emit(chanel, resultado);
        }
      }
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
   	return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: error.message });
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
    const exist = data?.coordinates;
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