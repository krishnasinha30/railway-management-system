const router = require('express').Router();
const c = require('../controllers/announcementController');
const auth = require('../middleware/authMiddleware'); const roles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateRequest'); const validators = require('../validators/announcementValidators');
router.get('/', c.list); router.post('/', auth, roles('admin', 'employee'), validators.create, validate, c.create); router.put('/:id', auth, roles('admin', 'employee'), c.update); router.delete('/:id', auth, roles('admin'), c.remove);
module.exports = router;
