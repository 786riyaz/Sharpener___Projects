const { Student, Course } = require("../models");

// CREATE
const createStudent = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const student = await Student.create({ name, email, age });
    res.status(201).json(student);
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ error: error.message });
  }
};

// READ ALL - findAll()
const getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({ include: Course });
    res.status(200).json(students);
  } catch (error) {
    console.error("Read error:", error);
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// READ ONE - findByPk() (includes enrolled courses)
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id, { include: Course });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error("Read by ID error:", error);
    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message,
    });
  }
};

// UPDATE
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    await student.update({ name, email, age });
    res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
};

// DELETE
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    await student.destroy();
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
