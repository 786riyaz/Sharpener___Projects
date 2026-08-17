// routes/students.js
import express from "express";

import { getStudents } from "../controller/students.js";
const router = express.Router();

router.get("/", getStudents);

export default router;
