// routes/password.js
import express from "express";
import passwordController from "../controllers/password.js";
const router = express.Router();
router.post("/forgotpassword", passwordController.forgotPassword);
router.get("/resetpassword/:id", passwordController.getResetForm);
router.post("/resetpassword/:id", passwordController.resetPassword);
export default router;
