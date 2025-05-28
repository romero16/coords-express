const Users = require('../models/usersModel');

const getAllUsers = async () => {
  return await Users.getAllUsers();
};

module.exports = {
  getAllUsers
};

