const express = require('express');
const router = express.Router();
const { createListing, getAllListings, getListingById, claimListing, deleteListing, getStats } = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.get('/stats', getStats);
router.get('/', getAllListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id/claim', protect, claimListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
