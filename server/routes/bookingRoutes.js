const router = require('express').Router();
const c = require('../controllers/bookingController'); const auth = require('../middleware/authMiddleware'); const roles = require('../middleware/roleMiddleware'); const validate = require('../middleware/validateRequest'); const validators = require('../validators/bookingValidators');
router.post('/', auth, roles('passenger'), validators.create, validate, c.create); router.get('/my-bookings', auth, roles('passenger'), c.mine); router.get('/pnr/:pnr', auth, roles('passenger', 'admin'), c.pnr); router.get('/:id', auth, roles('passenger', 'admin'), c.get); router.put('/:id/cancel', auth, roles('passenger'), c.cancel); router.get('/', auth, roles('admin'), c.list); router.put('/:id', auth, roles('admin'), c.update);
module.exports = router;
