const { DataTypes } = require("sequelize");

const db = require("../utils/db-connection");

const Student = db.define(
  "Student",
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

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "students",
    timestamps: false,
  },
);

module.exports = Student;
