import express from "express";
import {
  createBus,
  getAvailableBuses,
  getBusBookings,
} from "../controllers/buses.js";

const router = express.Router();

router.post("/", createBus);
router.get("/available/:seats", getAvailableBuses);
router.get("/:id/bookings", getBusBookings);

export default router;
