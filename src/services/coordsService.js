const Route = require('../models/coordsModel');
const Mysql = require('../models/authModel');
const redisClient = require('../config/redis');
const { getDistance } = require('geolib');
require('dotenv').config();

const saveCoordsToRoute = async (req) => {
  const { user_id, carrier_id, shipping_id, trip_type } = req.user;
  const newCoordinates = req.body;

  const bufferKey = `routes_buffer_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
  const cacheKey = `routes_cache_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
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
    const existingRoute = await Route.findOne({
      user_id,
      carrier_id,
      shipping_id,
      trip_type
    });

    const dbCoordinates = existingRoute?.coordinates || [];

    const combinedCoordinates = [
      ...dbCoordinates,
      ...buffer
    ].map(coord => coord.point);

    const dataTranformed = {
      user_id,
      carrier_id,
      shipping_id,
      trip_type,
      coordinates: combinedCoordinates
    };

    return dataTranformed;
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
   return {
    user_id,
    carrier_id,
    shipping_id,
    trip_type,
    coordinates: rutaActualizada.coordinates.map(coord => coord.point)
  };

};


const getRoute = async (req) => {
const { user_id, carrier_id, shipping_id, trip_type } = req.user;

const bufferKey = `routes_buffer_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;
const cacheKey = `routes_cache_carrier_${carrier_id}_shipping_${shipping_id}_type_${trip_type}`;

  const cached = await redisClient.get(cacheKey);
  const bufferData = await redisClient.get(bufferKey);

  let data = [];


  if (cached) {
    data = JSON.parse(cached);
  } else {
    const response  = await Route.findOne({ user_id, carrier_id, shipping_id, trip_type }, { coordinates: 1 });
    if(!response){
      data = { user_id, carrier_id, shipping_id, trip_type, coordinates: []};
    }else{
      data = { user_id,carrier_id,shipping_id,trip_type, coordinates: response.coordinates.map(coord => coord.point) };
    }
   
    await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
  }
  if (bufferData) {
    const bufferCoords = JSON.parse(bufferData);
    if (!Array.isArray(data.coordinates)) {
      data.coordinates = [];
    } else {
      data.coordinates.push(...bufferCoords.map(coord => coord.point))
    }
  }
  
  return data;
};

const findOne = async (req) => {
  const { carrier_id, shipping_id, trip_type } = req.params;

  const filters = {
    carrier_id: Number(carrier_id),
    shipping_id: Number(shipping_id),
    trip_type: Number(trip_type),
  };

  const routes = await Route.find(filters).sort({ timestamp: -1 });
  const bufferKey = `routes_buffer_carrier_${filters.carrier_id}_shipping_${filters.shipping_id}_type_${filters.trip_type}`;
  
  const bufferData = await redisClient.get(bufferKey);
  const bufferCoords = bufferData ? JSON.parse(bufferData) : [];

    // await redisClient.del(bufferKey); //// AUXILIAR PARA BORRAR DE CACHE LOS REGISTROS, SOLO PARA PRUEBAS

  let  result = [];

  if (routes.length > 0) {
    for (const route of routes) {
      const storedCoords = Array.isArray(route.coordinates) ? route.coordinates : [];
      result = {
        // user_id: route.user_id,
        carrier_id: route.carrier_id,
        shipping_id: route.shipping_id,
        trip_type: route.trip_type,
        coordinates: [...storedCoords.map(coord => coord.point), ...bufferCoords.map(coord => coord.point)],
      };
    }
  } else if (bufferCoords.length > 0) {
    result = {
      // user_id: bufferCoords.user_id,
      carrier_id: filters.carrier_id,
      shipping_id: filters.shipping_id,
      trip_type: filters.trip_type,
      coordinates: bufferCoords.map(coord => coord.point),
    };
  }

  return result;
};

const getRouteFilter = async (req) => {
  const { user_id, carrier_id, shipping_id, trip_type } = req.query;
  const filters = {};
  if (user_id) filters.user_id = Number(user_id);
  if (carrier_id) filters.carrier_id = Number(carrier_id);
  if (shipping_id) filters.shipping_id = Number(shipping_id);
  if (trip_type) filters.trip_type = Number(trip_type);

  const routes = await Route.find(filters).sort({ timestamp: -1 });
  const routesWithBuffer = [];
  if(routes.length > 0){
    for (const route of routes) {
      const bufferKey = `routes_buffer_carrier_${route.carrier_id}_shipping_${route.shipping_id}_type_${route.trip_type}`;
      const bufferData = await redisClient.get(bufferKey);
      const bufferCoords = bufferData ? JSON.parse(bufferData) : [];
      const storedCoords = Array.isArray(route.coordinates) ? route.coordinates.map(c => c.point) : [];
      const combinedCoords = [...storedCoords, ...bufferCoords.map(c => c.point)];
      routesWithBuffer.push({
        carrier_id: route.carrier_id,
        shipping_id: route.shipping_id,
        trip_type: route.trip_type,
        coordinates: combinedCoords
      });
    }
  }else{
        // No hay rutas en la base de datos, buscar claves en Redis
    const redisKeys = await redisClient.keys('routes_buffer_carrier_*');
    // console.log(redisKeys);
    //  await redisClient.del(redisKeys);
    for (const key of redisKeys) {
      const match = key.match(/routes_buffer_carrier_(\d+)_shipping_(\d+)_type_(\d+)/);
      if (!match) continue;

      const [userId, carrierId, shippingId, tripType ] = match.map(Number);
      
      // Si hay filtros aplicados, los comparamos
      if (
        (user_id && Number(user_id) !== userId) ||
        (carrier_id && Number(carrier_id) !== carrierId) ||
        (shipping_id && Number(shipping_id) !== shippingId) ||
        (trip_type && Number(trip_type) !== tripType)
      ) {
        continue;
      }

      const bufferData = await redisClient.get(key);
      const bufferCoords = bufferData ? JSON.parse(bufferData) : [];
      routesWithBuffer.push({
        carrier_id: carrierId,
        shipping_id: shippingId,
        trip_type: tripType,
        coordinates: bufferCoords.map(c => c.point)
      });
    }
    
  }

  return routesWithBuffer;
};

const getDataByFilters = async (req, res) =>{
    const by = req.query['data[search]'];
    const date = [req.query['data[date][0]'] ?? null, req.query['data[date][1]'] ?? null];
    const filters = await buildFilters({ date: date });
    let fieldToReturn = null;
    if (by === 'carrier') {
      fieldToReturn = 'carrier_id';
    } else if (by === 'shipping') {
      fieldToReturn = 'shipping_id';
    }
   const ids = await Route.distinct(fieldToReturn, filters);

   if(ids.length > 0){
      return await Mysql.getInfoFilters({by,ids}, res);
   }else{
      return [];
   }

  
  
}

const buildFilters = async ({ date }) => {
  const filters = {};
  const [startDateRaw, endDateRaw] = date || [];

  if (startDateRaw || endDateRaw) {
    filters.timestamp = {};

    if (startDateRaw && startDateRaw !== 'null' && startDateRaw !== '') {
      const startDate = new Date(startDateRaw);
      startDate.setUTCHours(0, 0, 0, 0); // Inicio del día
      filters.timestamp.$gte = startDate;
    }

    if (endDateRaw && endDateRaw !== 'null' && endDateRaw !== '') {
      const endDate = new Date(endDateRaw);
      endDate.setUTCHours(23, 59, 59, 999); // Fin del día
      filters.timestamp.$lte = endDate;
    }
  }

  return filters;
};

const getRouteFilters = async (req) => {
  const { search,  carrier, shipping, type } = req.body.data;
  const resolvedType = type ?? 1;

  const filters = {};

  if (carrier) {
    filters.carrier_id = Number(carrier);
    const ids = await Mysql.carrierShippingsRoutes(filters.carrier_id);
    filters.shipping_id = { $in: ids };
    
  }
  if (shipping) filters.shipping_id = Number(shipping);
  if (resolvedType) filters.trip_type = Number(resolvedType);

  const routes = await Route.find(filters).sort({ timestamp: -1 });
  const routesWithBuffer = [];
  if(routes.length > 0){
    for (const route of routes) {
      const bufferKey = `routes_buffer_carrier_${route.carrier_id}_shipping_${route.shipping_id}_type_${route.trip_type}`;
      const bufferData = await redisClient.get(bufferKey);
      const bufferCoords = bufferData ? JSON.parse(bufferData) : [];
      const storedCoords = Array.isArray(route.coordinates) ? route.coordinates.map(c => c.point) : [];
      const combinedCoords = [...storedCoords, ...bufferCoords.map(c => c.point)];
      routesWithBuffer.push({
        carrier_id: route.carrier_id,
        shipping_id: route.shipping_id,
        trip_type: route.trip_type,
        coordinates: combinedCoords
      });
    }
  }else{
        // No hay rutas en la base de datos, buscar claves en Redis
    const redisKeys = await redisClient.keys('routes_buffer_carrier_*');
    // console.log(redisKeys);
    //  await redisClient.del(redisKeys);
    for (const key of redisKeys) {
      const match = key.match(/routes_buffer_carrier_(\d+)_shipping_(\d+)_type_(\d+)/);
      if (!match) continue;

      const [userId, carrierId, shippingId, tripType ] = match.map(Number);
      
      // Si hay filtros aplicados, los comparamos
      if (
        (carrier && Number(carrier) !== carrierId) ||
        (shipping && Number(shipping) !== shippingId) ||
        (resolvedType && Number(resolvedType) !== tripType)
      ) {
        continue;
      }

      const bufferData = await redisClient.get(key);
      const bufferCoords = bufferData ? JSON.parse(bufferData) : [];
      routesWithBuffer.push({
        carrier_id: carrierId,
        shipping_id: shippingId,
        trip_type: tripType,
        coordinates: bufferCoords.map(c => c.point)
      });
    }
    
  }

  return routesWithBuffer;
};



module.exports = {
  saveCoordsToRoute,
  getRoute,
  findOne,
  getRouteFilter,
  getDataByFilters,
  getRouteFilters
};

