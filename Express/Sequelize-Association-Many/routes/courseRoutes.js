const express = require("express");
const courseController = require("../controller/courseController");

const router = express.Router();

// CREATE a course
router.post("/addcourses", courseController.addCourse);

// READ all courses
router.get("/", courseController.getCourses);

// ADD course(s) to a student  -> populates studentcourses junction table
router.post("/addstudentCourses", courseController.addStudentsToCourses);

// REMOVE a course from a student
router.post("/removestudentCourse", courseController.removeStudentFromCourse);

module.exports = router;
