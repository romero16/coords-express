const Route = require('../models/coordsModel');
const redisClient = require('../config/redis');
const BATCH_SIZE = 10;

const saveCoordsToRoute = async (driverId, newCoordinates) => {

  // clave del buffer por chofer
  const bufferKey = `routes_buffer_${driverId}`;
  const cacheKey = `routes_cache_${driverId}`;

  // Obteniene buffer actual por cada chofer desde Redis (si existe)
  let bufferData = await redisClient.get(bufferKey);
  let buffer = bufferData ? JSON.parse(bufferData) : [];



  //Valida que las coordenadas recibidas no sean iguales entre si, por ejemplo lat y lng
  if (newCoordinates.length > 1) {
    const allNewCoordsEqual = newCoordinates.every(
      ([lng, lat]) =>
        lng === newCoordinates[0][0] && lat === newCoordinates[0][1]
    );
    if (allNewCoordsEqual) {
      return null;
    }
  }

  // Filtrar las nuevas coordenadas para no agregar repetidas en el buffer
  const uniqueNewCoords = newCoordinates.filter(([lng, lat]) => {
    return !buffer.some(
      ([existingLng, existingLat]) =>
        existingLng === lng && existingLat === lat
    );
  });

  if (uniqueNewCoords.length === 0) {
    return null;
  }

  // Guardando las coordenadas en buffer
  buffer.push(...uniqueNewCoords);

  // Guarda  las coordenadas en el buffer Redis
  await redisClient.set(bufferKey, JSON.stringify(buffer));
  if (buffer.length < BATCH_SIZE) {
    return null;
  }

  // Tomar batch para insertar
  const coordsToInsert = buffer.splice(0, BATCH_SIZE);

  // Guardar el buffer actualizado en Redis después de sacar batch
  await redisClient.set(bufferKey, JSON.stringify(buffer));

  // Guarda las coordenas en MongoDB
  const rutaActualizada = await Route.findOneAndUpdate(
    { driver: driverId },
    {
      $push: { 'path.coordinates': { $each: coordsToInsert } },
      timestamp: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await redisClient.del(cacheKey);
  return rutaActualizada;
};


const getRoute = async (driverId) => {
  const cacheKey = `routes_cache_${driverId}`;
  const bufferKey = `routes_buffer_${driverId}`;

  const cached = await redisClient.get(cacheKey);
  const bufferData = await redisClient.get(bufferKey);

  let data = [];

  if (cached) {
    data = JSON.parse(cached);
  } else {
    data = await Route.find({ driver: driverId }).sort({ timestamp: -1 });
    await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
  }

  if (bufferData) {
    const bufferCoords = JSON.parse(bufferData);
    if (data.length > 0) {
      data[0].path.coordinates.push(...bufferCoords);
    } else {
      data = [{
        path: {
          coordinates: bufferCoords
        }
      }];
    }
  }

  return data;
};

module.exports = {
  saveCoordsToRoute,
  getRoute
};

