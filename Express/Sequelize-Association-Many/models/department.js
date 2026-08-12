const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const Department = sequelize.define(
  "department",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "departments",
  }
);

module.exports = Department;
