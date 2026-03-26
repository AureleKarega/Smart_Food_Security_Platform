const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const controller = require('../controllers/FoodRequestController');

router.post('/', protect, controller.createRequest);
router.get('/', protect, controller.getUserRequests);

module.exports = router;
