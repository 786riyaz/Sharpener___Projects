import express from 'express';
import productsRoutes from './routes/products.js';
const app = express();
app.use(express.json()); // Add this line to parse JSON request bodies
const PORT = 3000;
app.use(express.static('public'));

app.use('/api/products', productsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});