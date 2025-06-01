const express = require('express');
const router = express.Router();
const usersController = require('../controllers/authController');

router.post('/login', usersController.login);
router.post('/refresh', usersController.refreshToken);


module.exports = router;
