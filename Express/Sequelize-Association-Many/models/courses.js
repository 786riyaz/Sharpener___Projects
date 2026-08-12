const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

const Course = sequelize.define(
  "courses",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "courses",
  }
);

module.exports = Course;
