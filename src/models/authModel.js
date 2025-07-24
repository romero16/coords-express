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
      .join('carrier_users as cu', 'u.id', 'cu.user_id')
      .join('shipping_requests as sr', 'cu.carrier_id', 'sr.carrier_id')
      .where('u.email', data.email)
      .where('u.active', 1)
      .where('sr.status_id','asignado')
      .whereNotNull('sr.start_at')
      .whereNull('sr.end_at')
      .whereNull('u.deleted_at')
      .groupBy('u.id', 'u.email', 'u.password','cu.carrier_id', 'sr.id')
      .select(
        'u.id as user_id',
        'cu.carrier_id',
        'sr.id as shipping_id',
        'sr.trip_type',
        'u.email',
        'u.password',
        dbMySQL.raw(`CONCAT('[', GROUP_CONCAT(CONCAT('"', r.name, '"')), ']') as roles`)
      )
      .first();
    if (!userResult) {
       return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED,  message: 'Credenciales incorrectas, o sin viajes asignados!'});
    }

    const validPassword = await bcryptjs.compare(data.password, userResult.password);
    if (!validPassword) {

      return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED,  message: 'Credenciales incorrectas, o sin viajes asignados!' });
    }



    const values = {
      user_id: userResult.user_id,
      carrier_id: userResult.carrier_id,
      shipping_id: userResult.shipping_id,
      trip_type: userResult.trip_type,
      role: JSON.parse(userResult.roles),
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
      user_id: user.user_id,
      carrier_id: user.carrier_id,
      shipping_id: user.shipping_id,
      trip_type: user.trip_type,
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

async function loginBySessionId(sessionId, res) {
    try {

      const user = await dbMySQL('sessions').where('id', sessionId).whereNotNull('user_id').select('user_id').first();
      if(user){
        const userResult = await dbMySQL('users as u')
          .join('model_has_roles as mhr', 'u.id', 'mhr.model_id')
          .join('roles as r', 'mhr.role_id', 'r.id')
          .where('u.id', user.user_id)
          .where('u.active', 1)
          .whereNull('u.deleted_at')
          .groupBy('u.id')
          .select(
            'u.id as user_id',
            dbMySQL.raw(`CONCAT('[', GROUP_CONCAT(CONCAT('"', r.name, '"')), ']') as roles`)
          )
          .first();

          if (!userResult) {
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED,  message: 'Autentificación inválida!'});
          }

        return {
          user_id: userResult.user_id,
          role: JSON.parse(userResult.roles),
        };
      }
		  return null;

    } catch (error) {
      	return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: error.message });
    }
}

module.exports = {
  login,
  refreshToken,
  loginBySessionId
};

