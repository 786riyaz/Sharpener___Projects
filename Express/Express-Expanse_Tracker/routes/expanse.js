// routes/expanse.js
import express from "express";
import expanseController from "../controllers/expanse.js";
import isAuthenticated from "../middleware/auth.js";
const router = express.Router();
router.route("/").get(isAuthenticated, expanseController.getExpanse).post(isAuthenticated, expanseController.addExpanse);
// AI endpoints
router.post("/suggest-category", isAuthenticated, expanseController.suggestCategory);
router.get("/insights", isAuthenticated, expanseController.getInsights);
router.delete("/:id", isAuthenticated, expanseController.deleteExpanse);
export default router;
