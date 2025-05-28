const usersService = require('../services/usersService');

async function getUsers(req, res) {
 try {
    const data = await usersService.getAllUsers();
    res.status(200).json({data:data, message:'ok'});
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  getUsers
};
