const CommunityPost = require('../models/CommunityPost');

exports.createPost = async (req, res) => {
  try {
    const post = await CommunityPost.create({
      ...req.body,
      author: req.user._id
    });
    await post.populate('author', 'name avatar');
    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};

    const posts = await CommunityPost.find(filter)
      .populate('author', 'name avatar')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      author: req.user._id,
      content: req.body.content
    });

    await post.save();
    await post.populate('comments.author', 'name avatar');
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
