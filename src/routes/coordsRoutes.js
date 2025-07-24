
const express = require('express');
const router = express.Router();
const coordsController = require('../controllers/coordsController');
const authenticated = require('../midlewares/autenticate');
const authorizeRole = require('../midlewares/role');
const authenticateSessionId = require('../midlewares/autenticateSessionId');
const { Role } = require('../enums/roles.enum');
const  { saveCoordsRequest, findOneCoordsRequest }  = require('../requests/coords-request');


router.post('/save-coords', authenticated, authorizeRole(Role.CARRIER, Role.ROOT), saveCoordsRequest, coordsController.saveCoordsToRoute);
router.get('/find-all',authenticated, authorizeRole(Role.ROOT, Role.ADMIN), coordsController.getRouteFilter);
router.get('/find-one/carrier/:carrier_id/shipping/:shipping_id/type/:trip_type',
    authenticateSessionId(Role.ROOT), 
    authorizeRole(Role.ROOT), 
    findOneCoordsRequest,
    coordsController.findOne
);
router.get('/current-route',authenticated, authorizeRole(Role.CARRIER), coordsController.getRoute);


module.exports = router;
