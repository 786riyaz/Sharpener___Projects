// routes/attandances.js
import express from "express";

import { getAttandances, getAttandancesByDate, getTotal, insertRecord } from "../controller/attandances.js";
const router = express.Router();

router.get("/", getAttandances);

router.get("/total", getTotal);

router.get("/:date", getAttandancesByDate);

router.post("/", insertRecord);

export default router;
