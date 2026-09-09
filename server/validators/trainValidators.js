const { body } = require('express-validator')
exports.create = [body('trainNumber').trim().notEmpty().withMessage('Train number is required'), body('trainName').trim().notEmpty().withMessage('Train name is required'), body('source').isMongoId().withMessage('Valid source station is required'), body('destination').isMongoId().withMessage('Valid destination station is required')]
exports.update = [body('status').optional().isIn(['On Time', 'Delayed', 'Arrived', 'Departed', 'Cancelled']), body('delayMinutes').optional().isInt({ min: 0 })]
