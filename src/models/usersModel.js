const { dbMySQL  } = require('../config/db');

async function getAllUsers() {
  try {
    const [rows, fields] = await dbMySQL.query('SELECT * FROM users');
    return rows;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
  // return await knex('users').select('*');
}

module.exports = {
  getAllUsers
};

