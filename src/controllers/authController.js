const usersService = require('../services/authService');
const HttpStatus = require('../enums/status.enum');

async function login(req, res) {

   try {
      return await usersService.login(req.body, res);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: error.message });
    }
}

async function refreshToken(req, res){
  try {
    return await usersService.refreshToken(req, res);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({statusCode: HttpStatus.INTERNAL_SERVER_ERROR,  message: error.message });
  }
}

module.exports = {
  login,
  refreshToken
};
