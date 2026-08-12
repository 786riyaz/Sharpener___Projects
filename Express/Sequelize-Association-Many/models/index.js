const Student = require("./students");
const IdentityCard = require("./identitycard");
const Department = require("./department");
const Course = require("./courses");
const StudentCourses = require("./studentCourses");

// ONE-TO-ONE
Student.hasOne(IdentityCard);
IdentityCard.belongsTo(Student);

// ONE-TO-MANY
Department.hasMany(Student);
Student.belongsTo(Department);

// MANY-TO-MANY
Student.belongsToMany(Course, { through: StudentCourses });
Course.belongsToMany(Student, { through: StudentCourses });

module.exports = {
  Student,
  IdentityCard,
  Department,
  Course,
  StudentCourses,
};
