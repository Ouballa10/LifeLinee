const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

router.get('/:id', emergencyController.getEmergencyInfo);

module.exports = router;
