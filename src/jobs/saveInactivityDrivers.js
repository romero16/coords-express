const redisClient = require('../config/redis');
const Route = require('../models/coordsModel');
require('dotenv').config();


//FUNCION DE PARA OBTNER DEL BUFER LAS COORDENADAS
// DE AQUELLOS CHOFERES SIN ACTIVIDAD


// Utilidad para descomponer el identificador compuesto
const parseDriverKey = (driverKey) => {
  const match = driverKey.match(/user_(\d+)_carrier_(\d+)_shipping_(\d+)/);
  if (!match) return null;

  return {
    user_id: parseInt(match[1], 10),
    carrier_id: parseInt(match[2], 10),
    shipping_id: parseInt(match[3], 10)
  };
};

const flushBufferToMongo = async (driverKey) => {
  console.log('Procesando inactivo:', driverKey);

  const ids = parseDriverKey(driverKey);
  if (!ids) {
    console.warn('Formato inválido del driverKey:', driverKey);
    return;
  }

  const { user_id, carrier_id, shipping_id } = ids;

  const bufferKey = `routes_buffer_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}`;
  const cacheKey = `routes_cache_user_${user_id}_carrier_${carrier_id}_shipping_${shipping_id}`;

  const bufferData = await redisClient.get(bufferKey);
  if (!bufferData) return;

  const buffer = JSON.parse(bufferData);

  // Ignorar si no hay al menos 2 coordenadas (requisito de LineString)
  if (buffer.length < 2) return;

  // Insertar coordenadas en MongoDB
  await Route.findOneAndUpdate(
    { user_id, carrier_id, shipping_id },
    {
      $push: { 'path.coordinates': { $each: buffer } },
      timestamp: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Eliminar buffer y cache en Redis
  await redisClient.del(bufferKey);
  await redisClient.del(cacheKey);
};

//FUNCION PRINCIPAL QUE CARGA EL JOB PARA REVISAR LOS CHOFERES
// QUE TENGAN X TIEMPO SIN ACTIVIDAD

const saveInactiveDrivers = async () => {

  const inactivityThresholdMs = (parseInt(process.env.INACTIVITY_THRESHOLD_MINUTES, 10) || 30) * 60 * 1000;
  const now = Date.now();
  const cutoff = now - inactivityThresholdMs;

  const inactiveDrivers = await redisClient.zRangeByScore(
    'drivers_last_activity',
    0,
    cutoff
  );

  console.log("Inactivos: ", inactiveDrivers);
  for (const driver of inactiveDrivers) {
    await flushBufferToMongo(driver);
    await redisClient.zRem('drivers_last_activity', driver);
  }
};

module.exports = saveInactiveDrivers;
