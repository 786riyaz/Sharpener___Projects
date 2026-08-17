// controller/students.js
import db from "../db.js";

function getStudents(req, res) {
  db.query("SELECT Id AS Student_Id,Name FROM Students", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
}

export {getStudents};
