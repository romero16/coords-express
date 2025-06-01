
const express = require('express');
const router = express.Router();
const coordsController = require('../controllers/coordsController');
const authenticated = require('../midlewares/autenticate');
const authorizeRole = require('../midlewares/role');
const { Role } = require('../enums/roles.enum');


router.post('/save', authenticated, authorizeRole(Role.CUSTOMER), coordsController.saveCoordsToRoute);
router.get('/find-all/:driverId',authenticated, authorizeRole(Role.CUSTOMER), coordsController.getRoute);


module.exports = router;
