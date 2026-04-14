const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const qrController = require('../controllers/qrController');

router.get('/me', authMiddleware, qrController.getMyQRCode);

module.exports = router;
