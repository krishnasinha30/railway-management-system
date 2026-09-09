const router = require('express').Router();
const c = require('../controllers/foodController'); const auth = require('../middleware/authMiddleware'); const roles = require('../middleware/roleMiddleware');
router.get('/vendors', c.vendors); router.post('/vendors', auth, roles('admin'), c.createVendor); router.get('/orders', auth, roles('passenger', 'admin'), c.orders); router.post('/orders', auth, roles('passenger'), c.createOrder); router.put('/orders/:id', auth, roles('admin'), c.updateOrder);
module.exports = router;
