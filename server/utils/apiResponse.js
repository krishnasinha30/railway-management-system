exports.success = (res, data, message = 'Success', status = 200) => res.status(status).json({ success: true, message, data });
exports.failure = (res, message, errors = [], status = 400) => res.status(status).json({ success: false, message, errors });
