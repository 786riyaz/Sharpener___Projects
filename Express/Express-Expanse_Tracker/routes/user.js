import express from "express";
import userController from "../controllers/user.js";
const router = express.Router();
router.route("/register")
.get(userController.getRegisterForm)
.post(userController.addUserData);
router.route("/login")
.get(userController.getLoginForm)
.post(userController.userLogin);
router.post("/logout", userController.logout);
router.get("/session", userController.checkSession);
export default router;
