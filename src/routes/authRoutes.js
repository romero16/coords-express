const express = require('express');
const router = express.Router();
const usersController = require('../controllers/authController');
const  { Login, RefreshToken }  = require('../requests/auth-request');

router.post('/login', Login, usersController.login);
router.post('/refresh-token', RefreshToken, usersController.refreshToken);


module.exports = router;
