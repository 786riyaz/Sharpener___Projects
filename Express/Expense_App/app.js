import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expensesRouter from "./routes/expenses.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/expenses", expensesRouter);

app.get("/api/health", (req, res) => {
  res.json({
    message: "Expense Tracker API is running"
  });
});

export default app;
