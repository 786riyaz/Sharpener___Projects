// controller/attandances.js
import db from "../db.js";
import { getStudents } from "./students.js";

function getAttandances(req, res) {
  // const query = `SELECT a.Id, a.Student_Id, a.Date, a.Status, s.name FROM Attendances a JOIN Students s on  s.id=a.student_id`;
  const query = `SELECT a.Student_Id, s.Name, a.Date, a.Status FROM Attendances a JOIN Students s on s.id=a.student_id`;
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
}

function getAttandancesByDate(req, res) {
  const date = req.params.date;
  // const query = `SELECT a.Id, a.Student_Id, a.Date, a.Status, s.name FROM Attendances a JOIN Students s on  s.id=a.student_id WHERE Date=?`;
  const query = `SELECT a.Student_Id, s.Name, a.Status FROM Attendances a JOIN Students s on  s.id=a.student_id WHERE Date=?`;
  db.query(query, date, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length) {
      res.json(result);
    } else {
      getStudents(req, res);
    }
  });
}

function getTotal(req, res) {
  let getTotalPresentCountQuery = `SELECT a.Student_Id, s.Name, count(a.student_id) AS Count FROM attendances a join students s ON s.id = a.student_id WHERE status="present" GROUP BY a.student_id`;
  let getTotalCountQuery = `SELECT count(student_id) AS Total FROM attendances GROUP BY student_id limit 1`;
  let totalRecords;
  db.query(getTotalPresentCountQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.query(getTotalCountQuery, (err, total) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      totalRecords = total[0].Total;
      // console.log("Result ::", result);
      let resp = { records: result, count: totalRecords };
      res.json(resp);
    });
  });
}

function insertRecord(req, res) {
  let data = req.body;
  let keys = Object.keys(data);

  const query = `INSERT INTO Attendances (Student_id, Status, Date, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())`;

  let completed = 0;

  for (let i = 0; i < keys.length - 1; i++) {
    console.log(query, [keys[i], data[keys[i]], data["date"]]);

    db.query(query, [keys[i], data[keys[i]], data["date"]], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: err.message,
        });
      }

      completed++;

      if (completed === keys.length - 1) {
        res.json({
          message: "Attendance inserted successfully",
        });
      }
    });
  }
}
export { getAttandances, getAttandancesByDate, getTotal, insertRecord };
