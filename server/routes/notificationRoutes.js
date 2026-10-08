const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/notificationController');

router.use(auth);
router.get('/mine', controller.mine);
router.put('/read-all', controller.markAllRead);
router.put('/:id/read', controller.markRead);

module.exports = router;
