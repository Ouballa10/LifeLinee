const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const qrController = require('../controllers/qrController');

router.get('/me', authMiddleware, qrController.getMyQRCode);
router.get('/access-logs', authMiddleware, qrController.getMyAccessLogs);

module.exports = router;
