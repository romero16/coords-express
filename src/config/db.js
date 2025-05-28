const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const knex = require('knex');

// 'mongodb://admin:pass@localhost:27017/geoapi?authSource=admin'; // solo cuando usas usuario y contraseña
const dbGeoApi = mongoose.createConnection('mongodb://localhost:27017/geoapi');

const dbMySQL = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    //   password: '',
    database: 'sharkargo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// const dbMySQL = knex({
//   client: 'mysql2',
//   connection: {
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     // password: '', // si no tienes contraseña
//     database: 'sharkargo'
//   },
//   pool: { min: 0, max: 10 }
// });


dbGeoApi.on('connected', () => console.log('Conectado a MongoDB'));
dbGeoApi.on('error', (err) => console.error('Error conectando a MongoDB:', err));
dbGeoApi.on('disconnected', () => console.warn('Desconectado de MongoDB'));

async function testMySQLConnection() {
  try {
    const connection = await dbMySQL.getConnection();
    console.log('Conectado a MySQL');
    connection.release();
  } catch (err) {
    console.error('Error conectando a MySQL:', err);
  }
}


// async function testMySQLConnection() {
//   try {
//     await dbMySQL.raw('SELECT 1');
//     console.log('Conectado a MySQL con Knex');
//   } catch (err) {
//     console.error('Error conectando a MySQL con Knex:', err);
//   }
// }


testMySQLConnection();

module.exports = {
  dbGeoApi,
  dbMySQL
};
