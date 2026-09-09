const router = require('express').Router();
const c = require('../controllers/dashboardController'); const auth = require('../middleware/authMiddleware'); const roles = require('../middleware/roleMiddleware');
router.get('/overview', c.overview); router.get('/admin', auth, roles('admin'), c.admin); router.get('/employee', auth, roles('employee'), c.employee); router.get('/passenger', auth, roles('passenger'), c.passenger);
module.exports = router;
