const HttpStatus = require('../enums/status.enum');
const usersService = require('../services/authService');
const redisClient = require('../config/redis');
require('dotenv').config();



const authenticateSessionId = (requiredRole) => {
    return async (req, res, next) => {
        const sessionId = req.query.session;

        if (!sessionId) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Falta autentificación!',
          });
        }

        try {
          
          const redisKey = `session:${sessionId}`;
          const cachedSession = await redisClient.get(redisKey);
          if (cachedSession) {
            req.user = JSON.parse(cachedSession);
            return next();
          }
          const data = await usersService.loginBySessionId(sessionId, res);
          if (data && Array.isArray(data.role) &&  data.role.includes(requiredRole)) {
            await redisClient.setEx(redisKey, Number(process.env.TIME_SESSION_CACHE_VIEW_ROUTES), JSON.stringify(data));
            req.user = data;
            req.sessionId = sessionId;
            return next();
          } else {
            return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED,  message: 'Autentificación inválida!'});
          }
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: error.message });
        }
    };
};

module.exports = authenticateSessionId;
