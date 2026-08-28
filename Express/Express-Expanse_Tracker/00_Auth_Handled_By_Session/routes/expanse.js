// routes/expanse.js
import express from "express";
import expanseController from "../controllers/expanse.js";
import isAuthenticated from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(isAuthenticated, expanseController.getExpanse)
  .post(isAuthenticated, expanseController.addExpanse);

router.delete("/:id", isAuthenticated, expanseController.deleteExpanse);

export default router;
