const { Student, Attendance, sequelize } = require('../models');

// GET /api/attendance?date=YYYY-MM-DD
// If attendance already exists for that date -> return read-only list (present/absent)
// If not marked yet -> return the student list so the UI can render the radio-button form
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'date query param is required' });
    }

    const students = await Student.findAll({ order: [['id', 'ASC']] });

    const existingRecords = await Attendance.findAll({
      where: { date },
      include: [{ model: Student, as: 'student' }],
    });

    if (existingRecords.length > 0) {
      const data = existingRecords
        .sort((a, b) => a.student.id - b.student.id)
        .map((r) => ({
          studentId: r.student.id,
          name: r.student.name,
          status: r.status,
        }));
      return res.json({ marked: true, date, data });
    }

    const data = students.map((s) => ({ studentId: s.id, name: s.name, status: null }));
    return res.json({ marked: false, date, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/attendance
// body: { date: 'YYYY-MM-DD', records: [{ studentId, status: 'present' | 'absent' }, ...] }
exports.markAttendance = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records) || records.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'date and records[] are required' });
    }

    const invalid = records.find((r) => !r.studentId || !['present', 'absent'].includes(r.status));
    if (invalid) {
      await t.rollback();
      return res.status(400).json({ message: 'Every record needs a valid studentId and status' });
    }

    for (const r of records) {
      await Attendance.upsert(
        { studentId: r.studentId, date, status: r.status },
        { transaction: t }
      );
    }

    await t.commit();
    return res.json({ message: 'Attendance marked successfully', date });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/report  (optionally ?upto=YYYY-MM-DD to limit the range)
// Returns, per student, how many sessions they were present out of the
// total number of attendance-taking dates so far, plus a percentage.
exports.getAttendanceReport = async (req, res) => {
  try {
    const { upto } = req.query;
    const dateWhere = upto ? { date: { [require('sequelize').Op.lte]: upto } } : {};

    const totalDatesRows = await Attendance.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('date')), 'date']],
      where: dateWhere,
      raw: true,
    });
    const totalSessions = totalDatesRows.length;

    const students = await Student.findAll({
      order: [['id', 'ASC']],
      include: [
        {
          model: Attendance,
          as: 'attendances',
          where: dateWhere,
          required: false,
        },
      ],
    });

    const report = students.map((s) => {
      const presentCount = s.attendances.filter((a) => a.status === 'present').length;
      const percentage = totalSessions === 0 ? 0 : Math.round((presentCount / totalSessions) * 100);
      return {
        studentId: s.id,
        name: s.name,
        present: presentCount,
        total: totalSessions,
        percentage,
      };
    });

    res.json({ totalSessions, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({ order: [['id', 'ASC']] });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
