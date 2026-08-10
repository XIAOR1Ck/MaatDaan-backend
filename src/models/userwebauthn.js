'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserWebAuthn extends Model {
    static associate(models) {
      UserWebAuthn.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }

  UserWebAuthn.init(
    {
      credentialId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      publicKey: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      counter: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },

      transports: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'UserWebAuthn',
      tableName: 'WebAuthnCredentials',
    }
  );

  return UserWebAuthn;
};
