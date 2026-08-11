"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ElectionEligibility extends Model {
    static associate(models) {
      // associations if needed
    }
  }

  ElectionEligibility.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      fabricElectionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      eligibleVoters: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "ElectionEligibility",
      tableName: "ElectionEligibility",
      timestamps: true,
    }
  );

  return ElectionEligibility;
};
