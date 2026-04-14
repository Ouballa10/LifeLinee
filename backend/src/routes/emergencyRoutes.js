const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

router.get('/:token', emergencyController.getEmergencyInfo);
router.post('/:token/log', emergencyController.logEmergencyAccess);

module.exports = router;
