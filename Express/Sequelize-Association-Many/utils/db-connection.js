const { Sequelize } = require("sequelize");
require("dotenv").config();

// NOTE: Update the values below (or use a .env file based on .env.example)
// to match your local MySQL Workbench credentials.
const sequelize = new Sequelize(
  process.env.DB_NAME || "testdb",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "12345678",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
