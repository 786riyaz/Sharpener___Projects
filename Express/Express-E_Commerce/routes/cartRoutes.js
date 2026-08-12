import express from "express";

const router = express.Router();

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  res.send(`Fetching cart for user with ID: ${userId}`);
});

router.post("/:userId", (req, res) => {
  const userId = req.params.userId;

  res.send(`Adding product to the cart for user with ID: ${userId}`);
});

export default router;