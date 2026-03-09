const FoodListing = require('../models/FoodListing');
const User = require('../models/User');

exports.createListing = async (req, res) => {
  try {
    const listing = await FoodListing.create({
      ...req.body,
      donor: req.user._id
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { impactPoints: 10, mealsShared: 1 }
    });

    res.status(201).json({ listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'available';

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const listings = await FoodListing.find(filter)
      .populate('donor', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id)
      .populate('donor', 'name avatar email')
      .populate('claimedBy', 'name');

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
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({ message: 'This listing is no longer available' });
    }

    if (listing.donor.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim your own listing' });
    }

    listing.status = 'claimed';
    listing.claimedBy = req.user._id;
    await listing.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { impactPoints: 5, mealsReceived: 1 }
    });

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await FoodListing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalListings = await FoodListing.countDocuments();
    const claimedListings = await FoodListing.countDocuments({ status: 'claimed' });
    const totalUsers = await User.countDocuments();

    const co2Stats = await FoodListing.aggregate([
      { $match: { status: 'claimed' } },
      { $group: { _id: null, totalCo2: { $sum: '$co2Saved' }, totalServings: { $sum: '$servings' } } }
    ]);

    res.json({
      stats: {
        totalListings,
        claimedListings,
        totalUsers,
        totalCo2Saved: co2Stats[0]?.totalCo2 || 0,
        totalServings: co2Stats[0]?.totalServings || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
