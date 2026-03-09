const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');

exports.createListing = async (req, res) => {
  try {
    const listing = await FoodListing.create({
      ...req.body,
      donorId: req.user.id
    });

    await User.increment(
      { impactPoints: 10, mealsShared: 1 },
      { where: { id: req.user.id } }
    );

    const result = await FoodListing.findByPk(listing.id, {
      include: [{ model: User, as: 'donor', attributes: ['id', 'name', 'avatar'] }]
    });

    res.status(201).json({ listing: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const where = {};

    if (category) where.category = category;
    if (status) where.status = status;
    else where.status = 'available';

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const listings = await FoodListing.findAll({
      where,
      include: [{ model: User, as: 'donor', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await FoodListing.findByPk(req.params.id, {
      include: [
        { model: User, as: 'donor', attributes: ['id', 'name', 'avatar', 'email'] },
        { model: User, as: 'claimedBy', attributes: ['id', 'name'] }
      ]
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimListing = async (req, res) => {
  try {
    const listing = await FoodListing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({ message: 'This listing is no longer available' });
    }

    if (listing.donorId === req.user.id) {
      return res.status(400).json({ message: 'You cannot claim your own listing' });
    }

    listing.status = 'claimed';
    listing.claimedById = req.user.id;
    await listing.save();

    await User.increment(
      { impactPoints: 5, mealsReceived: 1 },
      { where: { id: req.user.id } }
    );

    const result = await FoodListing.findByPk(listing.id, {
      include: [
        { model: User, as: 'donor', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'claimedBy', attributes: ['id', 'name'] }
      ]
    });

    res.json({ listing: result });
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

    if (listing.donorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await listing.destroy();
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalListings = await FoodListing.count();
    const claimedListings = await FoodListing.count({ where: { status: 'claimed' } });
    const totalUsers = await User.count();

    const [co2Stats] = await sequelize.query(`
      SELECT COALESCE(SUM(co2_saved), 0) as "totalCo2",
             COALESCE(SUM(servings), 0) as "totalServings"
      FROM food_listings WHERE status = 'claimed'
    `);

    res.json({
      stats: {
        totalListings,
        claimedListings,
        totalUsers,
        totalCo2Saved: parseFloat(co2Stats[0]?.totalCo2) || 0,
        totalServings: parseInt(co2Stats[0]?.totalServings) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
