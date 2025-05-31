const { dbMySQL } = require('../config/db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function login(data, res) {
  try {
    // const userResult = await dbMySQL('users as u')
    //   .where({ email: data.email, /* active: 1, deleted_at: null */ })
    //   .join('model_has_roles mhr on u.id = mhr.model_id')
    //   .select('u.id', 'u.email', 'u.password', /*'active', 'deleted_at'*/ )
    //   .first();

    const userResult = await dbMySQL('users as u')
      .join('model_has_roles as mhr', 'u.id', 'mhr.model_id')
      .join('roles as r', 'mhr.role_id', 'r.id')
      .where('u.email', data.email)
      // .where('u.active', 1)
      // .whereNull('u.deleted_at')
      .groupBy('u.id', 'u.email', 'u.password')
      .select(
        'u.id',
        'u.email',
        'u.password',
        dbMySQL.raw('JSON_ARRAYAGG(r.name) as roles')
      )
      .first();

      console.log(userResult);

    if (!userResult) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const validPassword = await bcryptjs.compare(data.password, userResult.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      {
        id: userResult.id,
        email: userResult.email
      },
      process.env.JWTKEY,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = {
  login
};

