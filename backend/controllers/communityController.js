const { CommunityPost, Comment } = require('../models/CommunityPost');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const post = await CommunityPost.create({
      ...req.body,
      authorId: req.user.id
    });

    const result = await CommunityPost.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar'] }]
    });

    res.status(201).json({ post: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const { type } = req.query;
    const where = type ? { type } : {};

    const posts = await CommunityPost.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likes = post.likes || [];
    const userId = req.user.id;
    const index = likes.indexOf(userId);

    if (index === -1) {
      likes.push(userId);
    } else {
      likes.splice(index, 1);
    }

    post.likes = likes;
    post.changed('likes', true);
    await post.save();

    const result = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar'] }]
        }
      ]
    });

    res.json({ post: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Comment.create({
      postId: post.id,
      authorId: req.user.id,
      content: req.body.content
    });

    const result = await CommunityPost.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar'] }]
        }
      ]
    });

    res.json({ post: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
