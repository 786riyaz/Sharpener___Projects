import express from 'express';
import { students } from "../data.js";
const router = express.Router();

// GET /students
router.get('/', (req, res) => {
    res.send("Students: " + students.map(student => student.name).join(", "));
//   res.send(students);
});

router.get('/:id', (req, res) => {
    let result = students.find(student => student.id === parseInt(req.params.id));
    if (!result) {
        return res.status(404).send("Student not found");
    }
    res.send("Student: " + result.name);
});

export default router;