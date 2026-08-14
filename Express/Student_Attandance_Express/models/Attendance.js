const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define(
  'Attendance',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent'),
      allowNull: false,
    },
  },
  {
    tableName: 'attendances',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'date'],
      },
    ],
  }
);

module.exports = Attendance;
