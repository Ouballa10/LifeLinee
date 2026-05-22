const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const documentsController = require('../controllers/documentsController');

router.get('/', authMiddleware, documentsController.listDocuments);
router.post('/upload', authMiddleware, documentsController.uploadDocument);
router.delete('/:id', authMiddleware, documentsController.deleteDocument);

module.exports = router;
