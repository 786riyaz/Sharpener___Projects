import express from "express";

import {
  createBus,
  getAvailableBuses,
} from "../controllers/buses.js";

const router = express.Router();


// POST /buses
router.post("/", createBus);


// GET /buses/available/:seats
router.get("/available/:seats", getAvailableBuses);


export default router;