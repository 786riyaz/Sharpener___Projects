import express from 'express';
import { serveFile, addProduct } from '../controllers/products.js';
const router = express.Router();

router.get('/', serveFile);
router.post('/', addProduct);

export default router;