const coordsService = require('../services/coordsService');



const saveCoords = async (req, res) => {
  const coords = req.body;

  if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return res.status(400).json({ error: 'Debe enviar lat y lng como números.' });
  }

  try {
    const resultado = await coordsService.saveCoords(coords);
    req.io.emit('newCoords', resultado);
    res.status(201).json({ mensaje: 'Coordenadas guardadas', data: resultado });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getCoords = async (req, res) => {
  try {
    const data = await coordsService.getAllCoords();
    res.status(200).json({data:data, message:'ok'});
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  saveCoords,
  getCoords
};
