const sequelize = require('../config/db');
const Student = require('./Student');
const Attendance = require('./Attendance');

// One-to-Many: A Student has many Attendance records
Student.hasMany(Attendance, {
  foreignKey: 'studentId',
  as: 'attendances',
  onDelete: 'CASCADE',
});
Attendance.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student',
});

module.exports = {
  sequelize,
  Student,
  Attendance,
};
