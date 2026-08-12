const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-connection");

// Junction / through table for the Student <-> Course Many-to-Many association
const StudentCourses = sequelize.define(
  "studentCourses",
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "studentcourses",
  }
);

module.exports = StudentCourses;
