import express from "express";
const app = express();
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
// const productsRouter = require("./routes/products");
// const categoriesRouter = require("./routes/categories");

app.use(loggingMiddleware);
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);

app.use((req, res) => {
  // app.use('*',(req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

function loggingMiddleware(req, res, next) {
  console.log(`${req.method} request made to ${req.url}`);
  next();
}
