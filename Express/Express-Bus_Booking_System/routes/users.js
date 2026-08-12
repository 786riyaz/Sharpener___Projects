import express from "express";

import {
  createUser,
  getUsers,
} from "../controllers/users.js";

const router = express.Router();


// POST /users
router.post("/", createUser);


// GET /users
router.get("/", getUsers);


export default router;