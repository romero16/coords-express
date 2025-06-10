const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url:  process.env.REDIS_URI,
  legacyMode: true,
});

redisClient.connect().catch(console.error);

redisClient.on('connect', () => {
  console.log('Conectado a Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = redisClient;
