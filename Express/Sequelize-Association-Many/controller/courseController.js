const { Student, Course } = require("../models");

// CREATE COURSE
const addCourse = async (req, res) => {
  try {
    const { name } = req.body;
    const course = await Course.create({ name });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ ALL COURSES
const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD COURSES TO STUDENT (populates the studentcourses junction table)
const addStudentsToCourses = async (req, res) => {
  try {
    const { studentId, courseIds } = req.body;

    // Find student
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find courses
    const courses = await Course.findAll({
      where: { id: courseIds },
    });

    if (courses.length === 0) {
      return res.status(404).json({ message: "No matching courses found" });
    }

    // Add courses to student -> Sequelize auto-generated M:N helper
    // (creates rows in the studentcourses junction table)
    await student.addCourses(courses);

    // Get updated student with courses
    const updatedStudent = await Student.findByPk(studentId, {
      include: Course,
    });

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// REMOVE A COURSE FROM A STUDENT
const removeStudentFromCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await student.removeCourse(course);

    const updatedStudent = await Student.findByPk(studentId, {
      include: Course,
    });

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCourse,
  getCourses,
  addStudentsToCourses,
  removeStudentFromCourse,
};
