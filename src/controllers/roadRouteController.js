const HttpStatus = require('../enums/status.enum');
const RoadRoute = require('../models/roadRoute');


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
     return res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK,message: 'Datos gurdados correctamente',data: response});
  } catch (error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: error.message });
  }
};


module.exports = {
  saveRoadRoute
};