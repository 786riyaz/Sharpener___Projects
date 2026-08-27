// routes.user.js
import express from "express";

import userController from "../controllers/user.js";
const router = express.Router();

// router.get("/register", userController.getRegisterForm);
// router.post("/register", userController.addUserData);
router.route("/register")
.get(userController.getRegisterForm)
.post(userController.addUserData);

// router.get("/login", userController.getLoginForm);
// router.post("/login", userController.userLogin);
router.route("/login")
.get(userController.getLoginForm)
.post(userController.userLogin);

export default router;
