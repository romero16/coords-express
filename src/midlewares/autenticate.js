const jwt = require('jsonwebtoken');
const HttpStatus = require('../enums/status.enum');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(HttpStatus.UNAUTHORIZED).json({statusCode: HttpStatus.UNAUTHORIZED,  message: 'Token requerido!' });

  jwt.verify(token, process.env.JWTKEY, (err, user) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({statusCode: HttpStatus.UNAUTHORIZED,  message: 'Token inválido!' }); 
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
