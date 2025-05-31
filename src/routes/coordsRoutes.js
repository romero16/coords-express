const express = require('express');
const router = express.Router();
const coordsController = require('../controllers/coordsController');
const authenticated = require('../midlewares/autenticate');

router.post('/save', coordsController.saveCoords);
router.get('/find-all',authenticated, coordsController.getCoords);


module.exports = router;
