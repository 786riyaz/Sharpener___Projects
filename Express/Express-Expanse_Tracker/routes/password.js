// routes/password.js
import express from "express";
import passwordController from "../controllers/password.js";

const router = express.Router();

router.post("/forgotpassword", passwordController.forgotPassword);
router.post("/resetpassword", passwordController.resetPassword);

export default router;
