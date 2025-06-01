const coordsService = require('../services/coordsService');
const HttpStatus = require('../enums/status.enum');


const saveCoords = async (req, res) => {
  const coords = req.body;


  if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST,  message: 'Debe enviar lat y lng como números.' });
  }

  try {
    const resultado = await coordsService.saveCoords(coords);
    req.io.emit('newCoords', resultado);
    res.status(HttpStatus.CREATED).json({statusCode: HttpStatus.CREATED,  message: 'Coordenadas guardadas', data: resultado });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: 'Error interno del servidor'});
  }
};

const getCoords = async (req, res) => {
  try {
    const data = await coordsService.getAllCoords();
    res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK,  message: data.length > 0 ? 'Datos obtenidos correctamente' : 'No se encontraron registros.' , data:data.length > 0  ? data : [],});
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: 'Error interno del servidor'});
  }
};

module.exports = {
  saveCoords,
  getCoords
};
