
const express = require('express');
const router = express.Router();
const tollsController = require('../controllers/tollsController');
const authenticateSessionId = require('../midlewares/autenticateSessionId');
const { Role } = require('../enums/roles.enum');

router.post('/process-route', authenticateSessionId(Role.ROOT), tollsController.processRoute);

module.exports = router;
