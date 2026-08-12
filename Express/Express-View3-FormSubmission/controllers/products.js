import path from 'path';

const serveFile = (req, res) => {
  
  // This will not work because we are using ES modules and __dirname is not defined in ES modules. We need to use path.resolve() to get the absolute path of the file.
  // res.sendFile(path.join(__dirname, '../views/products.html'));
  // res.sendFile(path.join(__dirname, "..","views","products.html"));
  
  // This will work because we are using path.resolve() to get the absolute path of the file.
  // res.sendFile('products.html', { root: 'views' });
  res.sendFile(path.resolve('view', 'products.html'));
}

const addProduct = (req, res) => {
  const { productName } = req.body;
  console.log("Received Product Name:", productName);
  res.json({ message: `Product "${productName}" received successfully!` });
}

export { serveFile, addProduct };