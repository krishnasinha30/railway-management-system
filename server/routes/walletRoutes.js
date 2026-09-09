const router = require('express').Router();
const c = require('../controllers/walletController'); const auth = require('../middleware/authMiddleware'); const roles = require('../middleware/roleMiddleware');
router.get('/mine', auth, roles('passenger', 'employee', 'admin'), c.mine); router.post('/add-money', auth, roles('passenger'), c.addMoney); router.post('/withdraw', auth, roles('passenger'), c.withdraw); router.post('/promo', auth, roles('passenger'), c.applyPromo); router.put('/users/:id/adjust', auth, roles('admin'), c.adminAdjust); router.get('/transactions', auth, roles('admin'), c.adminTransactions);
module.exports = router;
