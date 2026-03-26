const { FoodRequest } = require('../models');

// CREATE REQUEST
exports.createRequest = async (req, res) => {
  try {
    const { foodName, location } = req.body;

    if (!foodName || !foodName.trim()) {
      return res.status(400).json({ message: 'foodName is required' });
    }

    const request = await FoodRequest.create({
      foodName: foodName.trim(),
      location,
      userId: req.user.id
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET USER REQUESTS
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await FoodRequest.findAll({
      where: { userId: req.user.id }
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};