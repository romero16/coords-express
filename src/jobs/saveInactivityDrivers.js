const redisClient = require('../config/redis');
const Route = require('../models/coordsModel');
require('dotenv').config();


// Utilidad para descomponer el identificador compuesto
const parseDriverKey = (driverKey) => {
  const match = driverKey.match(/user_(\d+)_carrier_(\d+)_shipping_(\d+)_type_(\d+)/);
  if (!match) return null;

  return {
    user_id: parseInt(match[1], 10),
    carrier_id: parseInt(match[2], 10),
    shipping_id: parseInt(match[3], 10),
    trip_type: parseInt(match[4], 10),
  };
};


//FUNCION DE PARA OBTNER DEL BUFER LAS COORDENADAS
// DE AQUELLOS CHOFERES SIN ACTIVIDAD
const flushBufferToMongo = async (driverKey) => {
  console.log('Procesando inactivo:', driverKey);

  const ids = parseDriverKey(driverKey);
  if (!ids) {
    console.warn('Formato inválido del driverKey:', driverKey);
    return;
  }

  const { user_id, carrier_id, shipping_id, trip_type } = ids;

  const bufferKey = `routes_buffer_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
  const cacheKey = `routes_cache_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;

  const bufferData = await redisClient.get(bufferKey);
  if (!bufferData) return;

  const rawCoords = JSON.parse(bufferData);
  // Ignorar si no hay al menos 2 coordenadas (requisito LineString)
  if (rawCoords.length < 2) return;

  const coordsWithTimestamps = rawCoords;
  // Guardar en Mongo con push
  await Route.findOneAndUpdate(
    { user_id, carrier_id, shipping_id, trip_type },
    {
      $push: { 'coordinates': { $each: coordsWithTimestamps } },
      timestamp: new Date()  // timestamp general de la ruta
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Eliminar buffer y cache
  await redisClient.del(bufferKey);
  await redisClient.del(cacheKey);
};

// const flushBufferToMongo = async (driverKey) => {
//   console.log('Procesando inactivo:', driverKey);

//   const ids = parseDriverKey(driverKey);
//   if (!ids) {
//     console.warn('Formato inválido del driverKey:', driverKey);
//     return;
//   }

//   const { user_id, carrier_id, shipping_id, trip_type } = ids;

//   const bufferKey = `routes_buffer_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
//   const cacheKey = `routes_cache_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
//   const bufferData = await redisClient.get(bufferKey);
//   if (!bufferData) return;

//   const buffer = JSON.parse(bufferData);

//   // Ignorar si no hay al menos 2 coordenadas (requisito de LineString)
//   if (buffer.length < 2) return;

//   // Insertar coordenadas en MongoDB
//     await Route.findOneAndUpdate(
//     { user_id, carrier_id, shipping_id, trip_type },
//     {
//       $push: { 'path.coordinates': { $each: buffer } },
//       timestamp: new Date()
//     },
//     { new: true, upsert: true, setDefaultsOnInsert: true }
//   );

//   // Eliminar buffer y cache en Redis
//   await redisClient.del(bufferKey);
//   await redisClient.del(cacheKey);
// };

//FUNCION PRINCIPAL QUE CARGA EL JOB PARA REVISAR LOS CHOFERES
// QUE TENGAN X TIEMPO SIN ACTIVIDAD

const saveInactiveDrivers = async () => {
  const inactivityThresholdMs = (parseFloat(process.env.INACTIVITY_THRESHOLD_MINUTES, 10) || 30) * 60 * 1000;
  const now = Date.now();
  const cutoff = now - inactivityThresholdMs;
  const inactiveDrivers = await redisClient.zRangeByScore(
    'drivers_last_activity',
    0,
    cutoff
  );

  console.log("INACTIVOS DETECTADOS:", inactiveDrivers);

  for (const driver of inactiveDrivers) {
    await flushBufferToMongo(driver);
    await redisClient.zRem('drivers_last_activity', driver);
  }
};

module.exports = saveInactiveDrivers;
