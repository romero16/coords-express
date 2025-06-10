const usersService = require('../services/authService');

async function getUsers(req, res) {

   try {
      return await usersService.login(req.body, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

module.exports = {
  getUsers
};
