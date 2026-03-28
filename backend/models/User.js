const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'student_id'
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  impactPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'impact_points'
  },
  mealsShared: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'meals_shared'
  },
  mealsReceived: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'meals_received'
  },
  role: {
    type: DataTypes.ENUM('student', 'moderator', 'admin'),
    defaultValue: 'student'
  },
  passwordResetTokenHash: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'password_reset_token_hash'
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'password_reset_expires'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.passwordResetTokenHash;
  delete values.passwordResetExpires;
  return values;
};

module.exports = User;
