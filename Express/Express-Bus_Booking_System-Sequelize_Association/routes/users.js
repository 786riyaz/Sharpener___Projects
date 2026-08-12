import express from "express";
import {
  createUser,
  getUsers,
  getUserBookings,
} from "../controllers/users.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id/bookings", getUserBookings);

export default router;
