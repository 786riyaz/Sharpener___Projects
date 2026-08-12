import {
  getAllProducts as getAllProductsService,
  getProductById as getProductByIdService,
  addProduct as addProductService
} from "../services/productService.js";


const getAllProducts = (req, res) => {
  const result = getAllProductsService();

  res.send(result);
};


const getProductById = (req, res) => {
  const productId = req.params.id;

  const result = getProductByIdService(productId);

  res.send(result);
};


const addProduct = (req, res) => {
  const result = addProductService();

  res.send(result);
};


export { getAllProducts, getProductById, addProduct };