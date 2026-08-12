import express from 'express';
import { courses } from "../data.js";
const router = express.Router();

// GET /courses
router.get('/', (req, res) => {
    res.send("Courses: " + courses.map(course => course.name).join(", "));
//   res.send(courses);
});

router.get('/:id', (req, res) => {
    let result = courses.find(course => course.id === parseInt(req.params.id));
    console.log(result);
    if (!result) {
        return res.status(404).send("Course not found");
    }
    res.send("Course: " + result.name + ", Description: " + result.description);
});

export default router;