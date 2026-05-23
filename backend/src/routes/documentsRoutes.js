const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const documentsController = require('../controllers/documentsController');

router.get('/', authMiddleware, documentsController.listDocuments);
router.get('/stats', authMiddleware, documentsController.getDocumentStats);
router.post('/upload', authMiddleware, documentsController.uploadDocument);
router.put('/:id', authMiddleware, documentsController.updateDocument);
router.delete('/:id', authMiddleware, documentsController.deleteDocument);
router.post('/bulk-delete', authMiddleware, documentsController.bulkDeleteDocuments);

module.exports = router;
