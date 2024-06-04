const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
	book_title: { type: String, required: true },
	author: { type: String, required: true },
	genre: { type: String, required: true },
	price: { type: Number, required: true },
	publication_date: { type: Date, required: true },
	publisher: { type: String, required: true },
	rating: { type: Number, required: true },
	stock_quantity: { type: Number, required: true },
	bestseller: { type: Boolean, required: true },
	language: { type: String, required: true },
	cover: { type: String, required: true },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
