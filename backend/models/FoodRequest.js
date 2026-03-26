// models/FoodRequest.js

module.exports = (sequelize, DataTypes) => {
  const FoodRequest = sequelize.define('FoodRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    foodName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    }
  });

  FoodRequest.associate = (models) => {
    FoodRequest.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  return FoodRequest;
};