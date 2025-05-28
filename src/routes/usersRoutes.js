const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userscontroller');

router.get('/find-all', usersController.getUsers);


module.exports = router;
