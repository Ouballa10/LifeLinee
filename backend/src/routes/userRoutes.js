const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.get('/me', authMiddleware, userController.getCurrentUserProfile);
router.put('/me', authMiddleware, userController.updateCurrentUserProfile);

module.exports = router;
