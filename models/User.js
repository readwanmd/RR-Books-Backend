// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
		refreshToken: { type: String },
	},
	{
		timestamps: true,
	}
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

// // Hash password before saving
// userSchema.pre('save', async function (next) {
// 	if (!this.isModified('password')) return next();
// 	console.log('hashing password...');
// 	const salt = await bcrypt.genSalt(10);
// 	this.password = await bcrypt.hash(this.password, salt);
// 	next();
// });

const User = mongoose.model('User', userSchema);

module.exports = User;
