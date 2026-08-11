const getProducts = (req, res) => {
  res.send("Fetching all products...");
}

const getProductById = (req, res) => {
  const productId = req.params.id;
  res.send(`Fetching product with ID: ${productId}`);
}

const addProduct = (req, res) => {
  res.send("Adding a new product");
}

const updateProduct = (req, res) => {
  const productId = req.params.id;
  res.send(`Updating product with ID: ${productId}`);
}

const deleteProduct = (req, res) => {
  const productId = req.params.id;
  res.send(`Deleting product with ID: ${productId}`);
}

export { getProducts, getProductById, addProduct, updateProduct, deleteProduct };