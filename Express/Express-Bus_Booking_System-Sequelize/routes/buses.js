import express from "express";

import { createBus, getAvailableBuses } from "../controllers/buses.js";

const router = express.Router();

router.post("/", createBus);

router.get("/available/:seats", getAvailableBuses);

export default router;
