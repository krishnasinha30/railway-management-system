const { body } = require('express-validator');
exports.register = [body('name').trim().isLength({ min: 2 }).withMessage('Name is required'), body('email').isEmail().withMessage('Valid email is required'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')];
exports.login = [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')];
