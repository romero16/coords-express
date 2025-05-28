const express = require('express');
const router = express.Router();
const coordsController = require('../controllers/coordsController');

router.post('/save', coordsController.saveCoords);
router.get('/getAll', coordsController.getCoords);


module.exports = router;
