import { Sequelize } from "sequelize";
import "dotenv/config";
import logger from "../utils/logger.js";

const sequelize = new Sequelize(
  process.env.DB_NAME || "expanse_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    // Route Sequelize's SQL logging into our log file instead of stdout,
    // and turn it off entirely in production.
    logging: process.env.NODE_ENV === "production" ? false : (msg) => logger.debug(msg),
  },
);

export default sequelize;
