import db from "./db/database.js";
import "./models/index.js";
import app from "./app.js";

const PORT = 3000;

const startServer = async () => {
  try {
    await db.authenticate();
    console.log("Database connected successfully!");

    // Use { alter: true } while developing so Sequelize adds the
    // UserId and BusId foreign-key columns to the Bookings table.
    // For a completely fresh database, db.sync() is enough.
    await db.sync({ alter: true });
    console.log("All tables synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

startServer();
