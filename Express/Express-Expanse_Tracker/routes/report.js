import express from "express";
import reportController from "../controllers/report.js";
import isAuthenticated from "../middleware/auth.js";

const router = express.Router();
router.get("/generate", isAuthenticated, reportController.generateReport);
router.get("/history", isAuthenticated, reportController.getHistory);

export default router;
