const Users = require('../models/authModel');

const login = async (data, res) => {
  return await Users.login(data, res);
};

module.exports = {
  login
};

