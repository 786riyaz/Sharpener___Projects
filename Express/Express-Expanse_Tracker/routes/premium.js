// routes/premium.js
import express from "express";
import premiumController from "../controllers/premium.js";
import isAuthenticated from "../middleware/auth.js";
import isPremiumUser from "../middleware/premium.js";

const router = express.Router();

router.get("/leaderboard", isAuthenticated, isPremiumUser, premiumController.getLeaderBoard);

export default router;
