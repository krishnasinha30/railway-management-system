const { body } = require('express-validator')
exports.create = [body('name').trim().notEmpty().withMessage('Station name is required'), body('stationCode').trim().isLength({ min: 2, max: 6 }).withMessage('Station code is required'), body('city').trim().notEmpty().withMessage('City is required'), body('totalPlatforms').isInt({ min: 1 }).withMessage('Total platforms must be positive')]
