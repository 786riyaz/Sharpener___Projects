import express from "express";

import { createUser, getUsers } from "../controllers/users.js";

const router = express.Router();

router.post("/", createUser);

router.get("/", getUsers);

export default router;
