import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Fetching all products");
});

router.get("/:id", (req, res) => {
  const productId = req.params.id;

  res.send(`Fetching product with ID: ${productId}`);
});

router.post("/", (req, res) => {
  res.send("Adding a new product");
});

export default router;