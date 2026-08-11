import express from "express";
import { getCartByUserId, addProductToCart } from "../controllers/cartController.js";
const router = express.Router();


router.get("/:userId",  getCartByUserId);

router.post("/:userId",  addProductToCart);

export default router;
