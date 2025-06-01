const express = require('express');
const router = express.Router();
const coordsController = require('../controllers/coordsController');
const authenticated = require('../midlewares/autenticate');
const authorizeRole = require('../midlewares/role');
const { Role } = require('../enums/roles.enum');

router.post('/save', authenticated, authorizeRole(Role.CUSTOMER), coordsController.saveCoords);
router.get('/find-all',authenticated, authorizeRole(Role.CUSTOMER), coordsController.getCoords);


module.exports = router;
