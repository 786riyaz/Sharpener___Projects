const express = require("express");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controller/studentController");

const router = express.Router();

// CREATE
router.post("/", createStudent);
// READ ALL
router.get("/", getStudents);
// READ ONE
router.get("/:id", getStudentById);
// UPDATE
router.put("/:id", updateStudent);
// DELETE
router.delete("/:id", deleteStudent);

module.exports = router;
