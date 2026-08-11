import express from "express";
import { getAllUsers, getUserById, addUser } from "../controllers/userController.js";
import authController from "../controllers/authController.js";

const router = express.Router();

router.get("/", authController.login, getAllUsers);

router.get("/:id", authController.login, getUserById);

router.post("/", authController.login, addUser);

export default router;