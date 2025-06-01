const { dbMySQL } = require('../config/db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpStatus = require('../enums/status.enum');
require('dotenv').config();

async function login(data, res) {
  try {

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
    if (!userResult) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const validPassword = await bcryptjs.compare(data.password, userResult.password);
    if (!validPassword) {

      return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED,  message: 'Credenciales incorrectas!' });
    }

    const values = {
      id: userResult.id,
      email: userResult.email,
      role: userResult.roles,
    };


    const token = jwt.sign(values, process.env.JWTKEY, { expiresIn: process.env.TOKEN_EXPIRATION });
    const refreshToken = jwt.sign(values, process.env.JWT_REFRESH_KEY, { expiresIn: process.env.REFRESH_EXPIRATION });

    res.status(HttpStatus.OK).json({statusCode: HttpStatus.OK,  message: 'Login exitoso', data: {token:token, refresh_token:refreshToken}});
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: error.message });
  }
}

async function refreshToken(req, res){
  const refreshToken = req.body.refresh_token;
  if (!refreshToken) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Token de actualización no proporcionado.',
    });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
    if (err) {
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Refresh token inválido o expirado.',
      });
    }

    const data = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = jwt.sign(data, process.env.JWTKEY, {
      expiresIn: process.env.TOKEN_EXPIRATION,
    });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Token renovado exitosamente.',
      data: {
        token: newAccessToken
      },
    });
  });
}

module.exports = {
  login,
  refreshToken
};

