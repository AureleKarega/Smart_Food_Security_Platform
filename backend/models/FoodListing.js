const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Food title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: true,
    enum: ['cooked-meal', 'raw-ingredients', 'snacks', 'beverages', 'baked-goods', 'fruits-vegetables', 'other']
  },
  quantity: {
    type: String,
    required: [true, 'Quantity is required']
  },
  servings: {
    type: Number,
    default: 1
  },
  dietaryInfo: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'halal', 'gluten-free', 'dairy-free', 'nut-free', 'none']
  }],
  allergens: {
    type: String,
    default: ''
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiry time is required']
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required']
  },
  pickupInstructions: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'claimed', 'expired'],
    default: 'available'
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  co2Saved: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

foodListingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.co2Saved = parseFloat((this.servings * 0.41).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('FoodListing', foodListingSchema);
