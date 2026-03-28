const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { User, FoodListing, CommunityPost, FoodRequest, Notification, AuditLog } = require('../models');

const createAuditLog = async ({ req, action, targetType, targetId, metadata = {} }) => {
  await AuditLog.create({
    actorId: req.user.id,
    actorRole: req.user.role,
    action,
    targetType,
    targetId: String(targetId),
    metadata
  });
};

exports.getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalListings,
      activeListings,
      claimedListings,
      totalPosts,
      totalRequests,
      pendingRequests
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: { [Op.in]: ['admin', 'moderator'] } } }),
      FoodListing.count(),
      FoodListing.count({ where: { status: 'available' } }),
      FoodListing.count({ where: { status: 'claimed' } }),
      CommunityPost.count(),
      FoodRequest.count(),
      FoodRequest.count({ where: { status: 'pending' } })
    ]);

    // NOTE: Avoid raw SQL column-name mismatches across models (underscored vs camelCase).
    // We compute daily activity in JS for the last 7 days using the Sequelize `createdAt` attribute.
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentListings, recentPosts, recentRequests] = await Promise.all([
      FoodListing.findAll({
        where: { createdAt: { [Op.gte]: since } },
        attributes: ['createdAt'],
        raw: true
      }),
      CommunityPost.findAll({
        where: { createdAt: { [Op.gte]: since } },
        attributes: ['createdAt'],
        raw: true
      }),
      FoodRequest.findAll({
        where: { createdAt: { [Op.gte]: since } },
        attributes: ['createdAt'],
        raw: true
      })
    ]);

    const toDayKey = (d) => {
      // Use UTC day buckets to keep grouping consistent across environments.
      return new Date(d).toISOString().slice(0, 10);
    };

    const activityMap = new Map();
    for (const row of recentListings) {
      const key = toDayKey(row.createdAt);
      activityMap.set(key, (activityMap.get(key) || 0) + 1);
    }
    for (const row of recentPosts) {
      const key = toDayKey(row.createdAt);
      activityMap.set(key, (activityMap.get(key) || 0) + 1);
    }
    for (const row of recentRequests) {
      const key = toDayKey(row.createdAt);
      activityMap.set(key, (activityMap.get(key) || 0) + 1);
    }

    const dailyActivity = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = toDayKey(day);
      dailyActivity.push({ day: key, count: activityMap.get(key) || 0 });
    }

    res.json({
      stats: {
        totalUsers,
        totalAdmins,
        totalListings,
        activeListings,
        claimedListings,
        totalPosts,
        totalRequests,
        pendingRequests
      },
      activity: dailyActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSystemActivity = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const [listingsData, postsData, requestsData] = await Promise.all([
      FoodListing.findAndCountAll({
        where: search ? { title: { [Op.iLike]: `%${search}%` } } : {},
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'donor', attributes: ['id', 'name', 'email'] }]
      }),
      CommunityPost.findAndCountAll({
        where: search ? { content: { [Op.iLike]: `%${search}%` } } : {},
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
      }),
      FoodRequest.findAndCountAll({
        where: search ? { foodName: { [Op.iLike]: `%${search}%` } } : {},
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, attributes: ['id', 'name', 'email'] }]
      })
    ]);

    res.json({
      recentListings: listingsData.rows,
      recentPosts: postsData.rows,
      recentRequests: requestsData.rows,
      pagination: {
        page,
        limit,
        search,
        listingsTotal: listingsData.count,
        postsTotal: postsData.count,
        requestsTotal: requestsData.count
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const usersData = await User.findAndCountAll({
      where: search
        ? {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } },
              { studentId: { [Op.iLike]: `%${search}%` } }
            ]
          }
        : {},
      limit,
      offset,
      attributes: ['id', 'name', 'email', 'studentId', 'role', 'impactPoints', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json({
      users: usersData.rows,
      pagination: {
        page,
        limit,
        search,
        total: usersData.count,
        totalPages: Math.ceil(usersData.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
    const offset = (page - 1) * limit;

    const logsData = await AuditLog.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'actor', attributes: ['id', 'name', 'email'] }]
    });

    res.json({
      logs: logsData.rows,
      pagination: {
        page,
        limit,
        total: logsData.count,
        totalPages: Math.ceil(logsData.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot downgrade your own admin access' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();
    await createAuditLog({
      req,
      action: 'update_user_role',
      targetType: 'user',
      targetId: user.id,
      metadata: { oldRole, newRole: role, targetEmail: user.email }
    });

    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await createAuditLog({
      req,
      action: 'delete_post',
      targetType: 'community_post',
      targetId: post.id,
      metadata: { authorId: post.authorId, type: post.type }
    });
    await post.destroy();
    res.json({ message: 'Post removed by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await FoodListing.findByPk(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    await createAuditLog({
      req,
      action: 'delete_listing',
      targetType: 'food_listing',
      targetId: listing.id,
      metadata: { donorId: listing.donorId, title: listing.title }
    });
    await listing.destroy();
    res.json({ message: 'Listing removed by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNotificationsReport = async (req, res) => {
  try {
    const [total, unread] = await Promise.all([
      Notification.count(),
      Notification.count({ where: { read: false } })
    ]);

    res.json({ notifications: { total, unread, read: total - unread } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const truncateNotification = (text, max = 255) => {
  if (!text) return text;
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
};

exports.getFoodRequests = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 50);
    const offset = (page - 1) * limit;
    const status = (req.query.status || 'all').trim().toLowerCase();

    const where = {};
    if (['pending', 'approved', 'rejected', 'notified'].includes(status)) {
      where.status = status;
    }

    const data = await FoodRequest.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'name', 'email', 'studentId'] }]
    });

    res.json({
      requests: data.rows,
      pagination: {
        page,
        limit,
        total: data.count,
        totalPages: Math.ceil(data.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveFoodRequest = async (req, res) => {
  try {
    const request = await FoodRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved' });
    }

    request.status = 'approved';
    await request.save();

    await createAuditLog({
      req,
      action: 'approve_food_request',
      targetType: 'food_request',
      targetId: request.id,
      metadata: { foodName: request.foodName, userId: request.userId }
    });

    await Notification.create({
      userId: request.userId,
      message: truncateNotification(
        `Your food request for "${request.foodName}" was approved. You will be notified when matching food is listed.`
      )
    });

    const withUser = await FoodRequest.findByPk(request.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'studentId'] }]
    });

    res.json({ message: 'Request approved', request: withUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectFoodRequest = async (req, res) => {
  try {
    const reason = (req.body?.reason || '').trim();
    const request = await FoodRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected' });
    }

    request.status = 'rejected';
    await request.save();

    await createAuditLog({
      req,
      action: 'reject_food_request',
      targetType: 'food_request',
      targetId: request.id,
      metadata: { foodName: request.foodName, userId: request.userId, reason: reason || undefined }
    });

    const base = `Your food request for "${request.foodName}" was not approved.`;
    const full = reason ? `${base} Reason: ${reason}` : base;
    await Notification.create({
      userId: request.userId,
      message: truncateNotification(full)
    });

    const withUser = await FoodRequest.findByPk(request.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'studentId'] }]
    });

    res.json({ message: 'Request rejected', request: withUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
