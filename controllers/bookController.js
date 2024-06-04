const Book = require('../models/Book');

// Create a new book
exports.createBook = async (req, res) => {
	const book = new Book(req.body);
	try {
		await book.save();
		res.status(201).json(book);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Update an existing book
exports.updateBook = async (req, res) => {
	try {
		const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!book) {
			return res.status(404).json({ message: 'Book not found' });
		}
		res.status(200).json(book);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Delete a book
exports.deleteBook = async (req, res) => {
	try {
		const book = await Book.findByIdAndDelete(req.params.id);
		if (!book) {
			return res.status(404).json({ message: 'Book not found' });
		}
		res.status(200).json({ message: 'Book deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get all books
exports.getBooks = async (req, res) => {
	try {
		const books = await Book.find();
		res.status(200).json(books);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
	try {
		const book = await Book.findById(req.params.id);
		if (!book) {
			return res.status(404).json({ message: 'Book not found' });
		}
		res.status(200).json(book);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};
