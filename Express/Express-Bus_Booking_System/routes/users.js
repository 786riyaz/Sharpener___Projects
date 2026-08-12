import express from "express";

import { createUser, updateUser, deleteUser } from "../controllers/users.js";

const router = express.Router();

// POST /users
router.post("/", createUser);

// PUT /users/:id
router.put("/:id", updateUser);

// DELETE /users/:id
router.delete("/:id", deleteUser);

export default router;
