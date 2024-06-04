const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { auth, adminAuth, staffAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
	'/auth/register',
	[
		check('username', 'Username is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').isLength({ min: 6 }),
	],
	userController.register
);

router.post(
	'/auth/login',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	userController.login
);

router.post('/auth/refresh-token', userController.refreshToken);

router.post('/auth/logout', auth, userController.logout);

router.get('/users', auth, userController.getUsers);
router.get('/profile/:id', auth, userController.getUserById);
router.patch('/profile/:id', auth, userController.updateUser);

router.post('/create-user', auth, adminAuth, userController.adminCreateUser);

router.delete('/delete-user/:id', auth, adminAuth, userController.deleteUser);

module.exports = router;
