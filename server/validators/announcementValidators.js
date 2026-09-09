const { body } = require('express-validator')
exports.create = [body('title').trim().notEmpty().withMessage('Title is required'), body('message').trim().notEmpty().withMessage('Message is required'), body('station').isMongoId().withMessage('Valid station is required'), body('priority').optional().isIn(['low', 'medium', 'high'])]
