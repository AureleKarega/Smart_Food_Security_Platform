const { sequelize, DataTypes } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
  });
};

module.exports = Notification;
