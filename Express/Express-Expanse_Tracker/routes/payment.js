// routes/payment.js
import express from "express";
import paymentController from "../controllers/payment.js";
import isAuthenticated from "../middleware/auth.js";
const router = express.Router();
router.post("/create-order", isAuthenticated, paymentController.createOrder);
router.get("/verify/:orderId", isAuthenticated, paymentController.verifyPayment);
export default router;
