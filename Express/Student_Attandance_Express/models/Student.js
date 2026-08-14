const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define(
  'Student',
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
    tableName: 'students',
    timestamps: true,
  }
);

module.exports = Student;
