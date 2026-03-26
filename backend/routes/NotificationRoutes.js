const express = require('express');
const router = express.Router();
const controller = require('../controllers/NotificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, controller.getNotifications);
router.patch('/:id/read', protect, controller.markAsRead);

module.exports = router;