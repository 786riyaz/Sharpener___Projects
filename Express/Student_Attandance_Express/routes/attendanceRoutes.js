const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/students', attendanceController.getStudents);
router.get('/attendance', attendanceController.getAttendanceByDate);
router.post('/attendance', attendanceController.markAttendance);
router.get('/report', attendanceController.getAttendanceReport);

module.exports = router;
