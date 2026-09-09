const router = require('express').Router();
const c = require('../controllers/stationController');
const auth = require('../middleware/authMiddleware');
const roles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateRequest');
const validators = require('../validators/stationValidators');
router.get('/', c.list); router.get('/:id', c.get); router.post('/', auth, roles('admin'), validators.create, validate, c.create); router.put('/:id', auth, roles('admin'), c.update); router.delete('/:id', auth, roles('admin'), c.remove);
module.exports = router;
