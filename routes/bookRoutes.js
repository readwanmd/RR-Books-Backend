const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { auth, staffAuth, adminAuth } = require('../middleware/authMiddleware');

router.get('/books', bookController.getBooks);
router.get('/books/:id', bookController.getBookById);

router.post('/books', auth, staffAuth, bookController.createBook);
router.patch('/books/:id', auth, staffAuth, bookController.updateBook);
router.delete('/books/:id', auth, staffAuth, bookController.deleteBook);

module.exports = router;
