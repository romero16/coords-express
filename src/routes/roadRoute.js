
const express = require('express');
const router = express.Router();
const roadRouteController = require('../controllers/roadRouteController');
const authenticateSessionId = require('../midlewares/autenticateSessionId');
const { Role } = require('../enums/roles.enum');

router.post('/save', authenticateSessionId(Role.ROOT), roadRouteController.saveRoadRoute);

module.exports = router;
