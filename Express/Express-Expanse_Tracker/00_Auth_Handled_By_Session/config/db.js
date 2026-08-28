// config/db.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("expanse_db", "root", "12345678", {
  host: "127.0.0.1",
  port: 3306,
  dialect: "mysql",
  logging: console.log,
});

export default sequelize;
