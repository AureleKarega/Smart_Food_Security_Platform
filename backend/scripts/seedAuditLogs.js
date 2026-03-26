require('dotenv').config();

const { connectDB, sequelize } = require('../config/db');
const { User, AuditLog } = require('../models');

const seedAuditLogs = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    throw new Error('No admin user found. Create an admin first.');
  }

  const now = Date.now();
  const logs = [
    {
      actorId: admin.id,
      actorRole: 'admin',
      action: 'delete_listing',
      targetType: 'food_listing',
      targetId: '101',
      metadata: { reason: 'Expired listing cleanup', title: 'Old Rice Pack' },
      createdAt: new Date(now - 1000 * 60 * 90),
      updatedAt: new Date(now - 1000 * 60 * 90),
    },
    {
      actorId: admin.id,
      actorRole: 'admin',
      action: 'delete_post',
      targetType: 'community_post',
      targetId: '77',
      metadata: { reason: 'Spam content', type: 'discussion' },
      createdAt: new Date(now - 1000 * 60 * 70),
      updatedAt: new Date(now - 1000 * 60 * 70),
    },
    {
      actorId: admin.id,
      actorRole: 'admin',
      action: 'update_user_role',
      targetType: 'user',
      targetId: '5',
      metadata: { oldRole: 'student', newRole: 'moderator', targetEmail: 'dummy@alustudent.com' },
      createdAt: new Date(now - 1000 * 60 * 40),
      updatedAt: new Date(now - 1000 * 60 * 40),
    },
    {
      actorId: admin.id,
      actorRole: 'admin',
      action: 'delete_listing',
      targetType: 'food_listing',
      targetId: '108',
      metadata: { reason: 'Policy violation', title: 'Unverified Meal' },
      createdAt: new Date(now - 1000 * 60 * 20),
      updatedAt: new Date(now - 1000 * 60 * 20),
    },
  ];

  await AuditLog.bulkCreate(logs);
  console.log(`Inserted ${logs.length} dummy audit logs for admin #${admin.id}`);
};

seedAuditLogs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to seed audit logs:', err.message);
    process.exit(1);
  });
