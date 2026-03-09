const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, likePost, addComment } = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.get('/', getAllPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;
