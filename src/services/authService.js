const Users = require('../models/authModel');

const login = async (data, res) => {
  return await Users.login(data, res);
};

const refreshToken = async (req, res)  => {
  return await Users.refreshToken(req, res);
}

const loginBySessionId = async (sessionId, res)  => {
  return await Users.loginBySessionId(sessionId, res);
}


module.exports = {
  login,
  refreshToken,
  loginBySessionId
};

