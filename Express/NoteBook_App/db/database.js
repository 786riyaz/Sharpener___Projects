import { Sequelize } from "sequelize";

const db = new Sequelize("notebookdb", "root", "12345678", {
  host: "localhost",
  dialect: "mysql",
  logging: console.log,
});

const connectDB = async () => {
  try {
    await db.authenticate();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

connectDB();

export default db;
