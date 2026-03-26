module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    actorRole: {
      type: DataTypes.ENUM('student', 'moderator', 'admin'),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    }
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'actorId',
      as: 'actor'
    });
  };

  return AuditLog;
};
