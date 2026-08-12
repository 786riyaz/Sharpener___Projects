import express from 'express';
import { serveFile } from '../controllers/products.js';
const router = express.Router();

router.get('/', serveFile);

export default router;