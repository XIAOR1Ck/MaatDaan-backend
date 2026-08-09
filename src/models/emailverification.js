'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmailVerification extends Model {
    static associate(models) {
      EmailVerification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }

  EmailVerification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      tokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'EmailVerification',
      tableName: 'EmailVerifications',
    }
  );

  return EmailVerification;
};
