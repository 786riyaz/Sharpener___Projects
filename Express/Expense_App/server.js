import db from "./db/database.js";
import "./models/expense.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.authenticate();
    console.log("Database connected successfully!");

    await db.sync();
    console.log("Expenses table synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Expense Tracker running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
