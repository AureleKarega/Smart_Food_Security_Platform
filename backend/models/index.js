const User = require('./User');
const FoodListing = require('./FoodListing');
const { CommunityPost, Comment } = require('./CommunityPost');

// FoodListing associations
User.hasMany(FoodListing, { foreignKey: 'donorId', as: 'donations' });
FoodListing.belongsTo(User, { foreignKey: 'donorId', as: 'donor' });
FoodListing.belongsTo(User, { foreignKey: 'claimedById', as: 'claimedBy' });

// CommunityPost associations
User.hasMany(CommunityPost, { foreignKey: 'authorId', as: 'posts' });
CommunityPost.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Comment associations
CommunityPost.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(CommunityPost, { foreignKey: 'postId' });
User.hasMany(Comment, { foreignKey: 'authorId', as: 'commentsMade' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = { User, FoodListing, CommunityPost, Comment };
