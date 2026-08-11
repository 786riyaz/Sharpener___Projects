import express from 'express';
import productsRoutes from './routes/products.js';
const app = express();
const PORT = 3000;

app.use('/api/products', productsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});