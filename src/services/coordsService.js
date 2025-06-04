const Route = require('../models/coordsModel');
const redisClient = require('../config/redis');
const { getDistance } = require('geolib');
require('dotenv').config();


// const saveCoordsToRoute = async (req) => {
// const { user_id, carrier_id, shipping_id, trip_type } = req.user;

//  const newCoordinates = req.body;

//   // clave del buffer por chofer
// const bufferKey = `routes_buffer_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
// const cacheKey = `routes_cache_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
// const redisValue = `user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;

//   // Obteniene buffer actual por cada chofer desde Redis (si existe)
//   let bufferData = await redisClient.get(bufferKey);
//   let buffer = bufferData ? JSON.parse(bufferData) : [];
//   let lastCoord = buffer[buffer.length - 1]; // última coordenada del buffer (si existe)

//   const uniqueNewCoords = newCoordinates.filter(([lng, lat]) => {
//     // Si no hay coordenada anterior, aceptamos la nueva
//     if (!lastCoord) {
//       lastCoord = [lng, lat]; // para futuras comparaciones en este batch
//       return true;
//     }

//     const distance = getDistance(
//       { latitude: lat, longitude: lng },
//       { latitude: lastCoord[1], longitude: lastCoord[0] }
//     );

//     if (distance >= process.env.MIN_DISTANCE_METERS) {
//       lastCoord = [lng, lat]; // actualizar la última aceptada
//       return true;
//     }
//     return false; // está muy cerca, no se guarda
//   });

//   if (uniqueNewCoords.length === 0) {
//     return null;
//   }
//   // Guardando las coordenadas en buffer
//   buffer.push(...uniqueNewCoords);

//   // Guarda  las coordenadas en el buffer Redis
//   await redisClient.set(bufferKey, JSON.stringify(buffer));

//   // Registrar última actividad del conductor en ZSET

//   await redisClient.zAdd('drivers_last_activity', {
//     score: Date.now(),
//     value: redisValue.toString()
//   });


//   if (buffer.length < process.env.BATCH_SIZE) {
//     return uniqueNewCoords;
//   }

//   // Tomar batch para insertar
//   const coordsToInsert = buffer.splice(0, process.env.BATCH_SIZE);

//   // Guardar el buffer actualizado en Redis después de sacar batch
//   await redisClient.set(bufferKey, JSON.stringify(buffer));

//   // Guarda las coordenas en MongoDB
//   const rutaActualizada = await Route.findOneAndUpdate(
//     {  user_id, carrier_id, shipping_id, trip_type },
//     {
//       $push: { 'path.coordinates': { $each: coordsToInsert } },
//       timestamp: new Date()
//     },
//     { new: true, upsert: true, setDefaultsOnInsert: true }
//   );

//   await redisClient.del(cacheKey);
//   return rutaActualizada;
// };

const saveCoordsToRoute = async (req) => {
  const { user_id, carrier_id, shipping_id, trip_type } = req.user;
  const newCoordinates = req.body;

  const bufferKey = `routes_buffer_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
  const cacheKey = `routes_cache_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
  const redisValue = `user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;

  let bufferData = await redisClient.get(bufferKey);
  let buffer = bufferData ? JSON.parse(bufferData) : [];
  let lastCoord = buffer.length > 0 ? buffer[buffer.length - 1].point || buffer[buffer.length - 1] : null;

  const uniqueNewCoords = newCoordinates.filter(([lng, lat]) => {
    if (!lastCoord) {
      lastCoord = [lng, lat];
      return true;
    }

    const distance = getDistance(
      { latitude: lat, longitude: lng },
      { latitude: lastCoord[1], longitude: lastCoord[0] }
    );

    if (distance >= process.env.MIN_DISTANCE_METERS) {
      lastCoord = [lng, lat];
      return true;
    }
    return false;
  });

  if (uniqueNewCoords.length === 0) {
    return null;
  }

  // ⬇️ Aquí se agregan timestamps al guardar en el buffer
  const uniqueNewCoordsWithTimestamps = uniqueNewCoords.map(([lng, lat]) => ({
    point: [lng, lat],
    timestamp: new Date()
  }));

  buffer.push(...uniqueNewCoordsWithTimestamps);

  await redisClient.set(bufferKey, JSON.stringify(buffer));

  await redisClient.zAdd('drivers_last_activity', {
    score: Date.now(),
    value: redisValue.toString()
  });

  if (buffer.length < process.env.BATCH_SIZE) {
    return uniqueNewCoordsWithTimestamps;
  }

  const coordsToInsert = buffer.splice(0, process.env.BATCH_SIZE);
  await redisClient.set(bufferKey, JSON.stringify(buffer));

  const rutaActualizada = await Route.findOneAndUpdate(
    { user_id, carrier_id, shipping_id, trip_type },
    {
      $push: { 'coordinates': { $each: coordsToInsert } },
      timestamp: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await redisClient.del(cacheKey);
  return rutaActualizada;
};


const getRoute = async (req) => {
const { user_id, carrier_id, shipping_id, trip_type } = req.user;

const bufferKey = `routes_buffer_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
const cacheKey = `routes_cache_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;

  const cached = await redisClient.get(cacheKey);
  const bufferData = await redisClient.get(bufferKey);

  let data = [];

  if (cached) {
    data = JSON.parse(cached);
  } else {
    data = await Route.find({ user_id, carrier_id, shipping_id, trip_type }).sort({ timestamp: -1 });
    await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
  }

  if (bufferData) {
    const bufferCoords = JSON.parse(bufferData);
    if (data.length > 0) {
      data[0].coordinates.push(...bufferCoords);
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

const getRouteFilter = async (req) =>{
        const { user_id, carrier_id, shipping_id, trip_type } = req.query;
        const filters = {};
        if (user_id) { filters.user_id = user_id}
        if (carrier_id) {filters.carrier_id = carrier_id}
        if (shipping_id) { filters.shipping_id = shipping_id}
        if (trip_type) { filters.trip_type = trip_type}

      const bufferKey = `routes_buffer_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
      const cacheKey = `routes_cache_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;

        const cached = await redisClient.get(cacheKey);
        const bufferData = await redisClient.get(bufferKey);

        let data = [];

        if (cached) {
          data = JSON.parse(cached);
        } else {
          data = await Route.find(filters).sort({ timestamp: -1 });
          await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
        }

        if (bufferData) {
          const bufferCoords = JSON.parse(bufferData);
          if (data.length > 0) {
            data[0].coordinates.push(...bufferCoords);
          } else {
            data = [{
              path: {
                coordinates: bufferCoords
              }
            }];
          }
        }

        return data;
}


module.exports = {
  saveCoordsToRoute,
  getRoute,
  getRouteFilter
};

