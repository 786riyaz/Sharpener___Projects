import express from "express";
import booksRouter from "./routes/books.js";

const PORT = 3000;
const app = express();

app.use(express.json());

app.use(loggingMiddleware);

app.use("/books", booksRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function loggingMiddleware(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}