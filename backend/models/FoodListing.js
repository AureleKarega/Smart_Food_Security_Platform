const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FoodListing = sequelize.define('FoodListing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('cooked-meal', 'raw-ingredients', 'snacks', 'beverages', 'baked-goods', 'fruits-vegetables', 'other'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  servings: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  dietaryInfo: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    field: 'dietary_info'
  },
  allergens: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  pickupLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'pickup_location'
  },
  pickupInstructions: {
    type: DataTypes.TEXT,
    defaultValue: '',
    field: 'pickup_instructions'
  },
  imageUrl: {
    type: DataTypes.STRING,
    defaultValue: '',
    field: 'image_url'
  },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'claimed', 'expired'),
    defaultValue: 'available'
  },
  donorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'donor_id'
  },
  claimedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'claimed_by_id'
  },
  co2Saved: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'co2_saved'
  }
}, {
  tableName: 'food_listings',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (listing) => {
      listing.co2Saved = parseFloat((listing.servings * 0.41).toFixed(2));
    }
  }
});

module.exports = FoodListing;
