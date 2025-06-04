
const express = require('express');
const router = express.Router();
const coordsController = require('../controllers/coordsController');
const authenticated = require('../midlewares/autenticate');
const authorizeRole = require('../midlewares/role');
const { Role } = require('../enums/roles.enum');
const  { saveCoords }  = require('../requests/coords-request');


router.post('/save-coords', authenticated, authorizeRole(Role.CARRIER, Role.CARRIER), saveCoords, coordsController.saveCoordsToRoute);
router.get('/current-route',authenticated, authorizeRole(Role.CARRIER), coordsController.getRoute);
router.get('/find-all',authenticated, authorizeRole(Role.CARRIER), coordsController.getRouteFilter);


module.exports = router;
