const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CommunityPost = sequelize.define('CommunityPost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('tip', 'story', 'event', 'discussion'),
    defaultValue: 'discussion'
  },
  likes: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: []
  }
}, {
  tableName: 'community_posts',
  timestamps: true,
  underscored: true
});

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'post_id'
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true
});

module.exports = { CommunityPost, Comment };
