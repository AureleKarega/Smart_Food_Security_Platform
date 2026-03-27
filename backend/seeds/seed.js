require('dotenv').config();

const { sequelize } = require('../config/db');
const {
  User,
  FoodListing,
  CommunityPost,
  Comment,
  FoodRequest,
  Notification,
  AuditLog
} = require('../models');

async function clearTables() {
  // Clear child tables first to avoid FK conflicts.
  await Comment.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await CommunityPost.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await FoodListing.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await FoodRequest.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await Notification.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await AuditLog.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
}

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    await clearTables();

    const [admin, donor, student] = await Promise.all([
      User.create({
        name: 'Admin User',
        email: 'admin@alu.edu',
        password: 'Password123!',
        studentId: 'ALU0001',
        role: 'admin',
        bio: 'Platform administrator.'
      }),
      User.create({
        name: 'Donor Student',
        email: 'donor@alu.edu',
        password: 'Password123!',
        studentId: 'ALU0002',
        role: 'student',
        bio: 'I love reducing food waste.'
      }),
      User.create({
        name: 'Receiver Student',
        email: 'receiver@alu.edu',
        password: 'Password123!',
        studentId: 'ALU0003',
        role: 'student',
        bio: 'Happy to claim shared meals.'
      })
    ]);

    const listing1 = await FoodListing.create({
      title: 'Fresh Veggie Wraps',
      description: 'Homemade veggie wraps, prepared this morning.',
      category: 'cooked-meal',
      quantity: '3 boxes',
      servings: 3,
      dietaryInfo: ['vegetarian'],
      allergens: 'gluten',
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      pickupLocation: 'Campus Cafeteria Gate A',
      pickupInstructions: 'Call when you arrive at gate.',
      imageUrl: '',
      status: 'available',
      donorId: donor.id
    });

    const listing2 = await FoodListing.create({
      title: 'Bananas and Apples',
      description: 'Assorted fruits from event leftovers.',
      category: 'fruits-vegetables',
      quantity: '1 basket',
      servings: 5,
      dietaryInfo: ['vegan', 'gluten-free'],
      allergens: '',
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      pickupLocation: 'Student Center Lobby',
      pickupInstructions: 'Pickup from front desk.',
      imageUrl: '',
      status: 'claimed',
      donorId: donor.id,
      claimedById: student.id
    });

    const post = await CommunityPost.create({
      authorId: donor.id,
      content: 'Tip: Label expiration times clearly to help faster claiming.',
      type: 'tip',
      likes: [student.id, admin.id]
    });

    await Comment.bulkCreate([
      {
        postId: post.id,
        authorId: student.id,
        content: 'Great tip, this helps a lot!'
      },
      {
        postId: post.id,
        authorId: admin.id,
        content: 'We will include this in onboarding guidelines.'
      }
    ]);

    await FoodRequest.bulkCreate([
      {
        foodName: 'Rice and Beans',
        location: 'Girls Dorm Block C',
        status: 'pending',
        userId: student.id
      },
      {
        foodName: 'Fruit Snacks',
        location: 'Library Floor 2',
        status: 'approved',
        userId: student.id
      }
    ]);

    await Notification.bulkCreate([
      {
        message: 'Your listing "Fresh Veggie Wraps" is now live.',
        read: false,
        userId: donor.id
      },
      {
        message: 'You successfully claimed "Bananas and Apples".',
        read: false,
        userId: student.id
      }
    ]);

    await AuditLog.bulkCreate([
      {
        actorId: admin.id,
        actorRole: 'admin',
        action: 'APPROVE_REQUEST',
        targetType: 'FoodRequest',
        targetId: 'sample-request',
        metadata: { reason: 'Meets criteria' }
      },
      {
        actorId: donor.id,
        actorRole: 'student',
        action: 'CREATE_LISTING',
        targetType: 'FoodListing',
        targetId: String(listing1.id),
        metadata: { title: listing1.title }
      },
      {
        actorId: student.id,
        actorRole: 'student',
        action: 'CLAIM_LISTING',
        targetType: 'FoodListing',
        targetId: String(listing2.id),
        metadata: { claimedById: student.id }
      }
    ]);

    console.log('Seed complete.');
    console.log('Users:', 3);
    console.log('Food listings:', 2);
    console.log('Community posts:', 1);
    console.log('Comments:', 2);
    console.log('Food requests:', 2);
    console.log('Notifications:', 2);
    console.log('Audit logs:', 3);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
