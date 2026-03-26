const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRoles('admin', 'moderator'));

router.get('/overview', controller.getOverview);
router.get('/activity', controller.getSystemActivity);
router.get('/users', controller.getUsers);
router.get('/audit-logs', controller.getAuditLogs);
router.patch('/users/:id/role', authorizeRoles('admin'), controller.updateUserRole);
router.delete('/moderation/posts/:id', controller.deletePost);
router.delete('/moderation/listings/:id', controller.deleteListing);
router.get('/reports/notifications', controller.getNotificationsReport);

module.exports = router;
