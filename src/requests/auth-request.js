const HttpStatus = require('../enums/status.enum');

function Login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
     return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST,  message: 'email y password son requeridos' });
  }
  next();
};

function RefreshToken(req, res, next) {
  const { refresh_token } = req.body;

  if (!refresh_token) {
     return res.status(HttpStatus.BAD_REQUEST).json({statusCode: HttpStatus.BAD_REQUEST,  message: 'refresh_token es requerido' });
  }
  next();
};


module.exports = {
  Login,
  RefreshToken
};

