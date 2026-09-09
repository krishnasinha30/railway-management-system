const router = require('express').Router();
const c = require('../controllers/taskController'); const auth = require('../middleware/authMiddleware'); const roles = require('../middleware/roleMiddleware');
router.get('/my-tasks', auth, roles('employee'), c.myTasks); router.post('/', auth, roles('admin'), c.create); router.put('/:id', auth, roles('employee'), c.update);
module.exports = router;
