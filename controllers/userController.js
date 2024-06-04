// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateTokens = (user) => {
	const accessToken = jwt.sign(
		{ id: user.id, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: '15m' }
	);
	const refreshToken = jwt.sign(
		{ id: user.id },
		process.env.JWT_REFRESH_SECRET,
		{ expiresIn: '7d' }
	);
	return { accessToken, refreshToken };
};

// Register a new user
exports.register = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { username, email, password, role } = req.body;

	try {
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ message: 'User already exists' });
		}

		user = new User({ username, email, password, role });

		// Hash password before saving
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);
		console.log('Hashed Password:', user.password); // Debugging log

		await user.save();

		const { accessToken, refreshToken } = generateTokens(user);
		user.refreshToken = refreshToken;
		await user.save();

		res.status(201).json({ accessToken, refreshToken });
	} catch (error) {
		console.error('Register error:', error); // Debugging log
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Login a user
exports.login = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			console.log(`User with email ${email} not found`); // Debugging log
			return res.status(400).json({ message: 'Invalid Credentials' });
		}

		console.log('Stored Hashed Password:', user.password); // Debugging log

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			console.log('Password mismatch for user:', email); // Debugging log
			return res.status(400).json({ message: 'Invalid Credentials' });
		}

		const { accessToken, refreshToken } = generateTokens(user);
		user.refreshToken = refreshToken;
		await user.save();

		res.status(200).json({
			id: user._id,
			username: user.username,
			email: user.email,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		console.error('Login error:', error); // Debugging log
		res.status(500).json({ message: 'Server error' });
	}
};

// Refresh token
exports.refreshToken = async (req, res) => {
	const { refreshToken } = req.body;
	if (!refreshToken) {
		return res.status(401).json({ message: 'Refresh token is required' });
	}

	try {
		const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
		const user = await User.findById(decoded.id);
		if (!user || user.refreshToken !== refreshToken) {
			return res.status(403).json({ message: 'Invalid refresh token' });
		}

		const { accessToken, newRefreshToken } = generateTokens(user);
		user.refreshToken = newRefreshToken;
		await user.save();

		res.status(200).json({ accessToken, refreshToken: newRefreshToken });
	} catch (error) {
		res
			.status(403)
			.json({ message: 'Invalid refresh token', error: error.message });
	}
};

// Logout user
exports.logout = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		user.refreshToken = null;
		await user.save();

		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Create a new user by admin
exports.adminCreateUser = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { username, email, password, role } = req.body;

	try {
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ message: 'User already exists' });
		}

		user = new User({ username, email, password, role });

		// Hash password before saving
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);

		await user.save();

		res.status(201).json({ message: 'User created successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get all users
exports.getUsers = async (req, res) => {
	try {
		const users = await User.find().select('username email role');
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get user by ID
exports.getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select(
			'username email role'
		);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Update user
exports.updateUser = async (req, res) => {
	try {
		// Check if the logged-in user is the same as the user to be updated
		if (req.user.id !== req.params.id) {
			return res
				.status(403)
				.json({ message: 'Unauthorized to update this profile' });
		}

		const updateData = { ...req.body };

		// If password is being updated, hash it
		if (updateData.password) {
			if (updateData.password.length < 6) {
				return res
					.status(400)
					.json({ message: 'Password must be at least 6 characters' });
			}
			const salt = await bcrypt.genSalt(10);
			updateData.password = await bcrypt.hash(updateData.password, salt);
		}

		const user = await User.findByIdAndUpdate(req.params.id, updateData, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Delete user
exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};
