const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const IdentityCard = sequelize.define(
  "identitycard",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "identitycards",
  }
);

module.exports = IdentityCard;
