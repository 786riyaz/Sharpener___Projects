import express from "express";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("E Commerce Home Page!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});