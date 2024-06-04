// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
	// console.log(req.headers);
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'No token, authorization denied' });
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ message: 'Token is not valid' });
	}
};

exports.adminAuth = (req, res, next) => {
	if (req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Admin resource. Access denied' });
	}
	next();
};

exports.staffAuth = (req, res, next) => {
	if (req.user.role !== 'staff' && req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Staff resource. Access denied' });
	}
	next();
};
