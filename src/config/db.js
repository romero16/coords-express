const mongoose = require('mongoose');
const knex = require('knex');
require('dotenv').config();

const dbMongo = mongoose.createConnection(process.env.MONGO_URI);
const dbMySQL = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  },
  pool: { min: 0, max: 10 }
});

dbMongo.on('connected', () => console.log('Conectado a MongoDB'));
dbMongo.on('error', (err) => console.error('Error conectando a MongoDB:', err));
dbMongo.on('disconnected', () => console.warn('Desconectado de MongoDB'));

async function testMySQLConnection() {
  try {
    await dbMySQL.raw('SELECT 1');
    console.log('Conectado a MySQL con Knex');
  } catch (err) {
    console.error('Error conectando a MySQL con Knex:', err);
  }
}


testMySQLConnection();

module.exports = {
  dbMongo,
  dbMySQL
};
