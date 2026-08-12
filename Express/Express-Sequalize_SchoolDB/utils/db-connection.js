const { Sequelize } = require("sequelize");

const db = new Sequelize("schooldb", "root", "12345678", {
    host: "localhost",
    dialect: "mysql",
    logging: console.log
});

db.authenticate()
    .then(() => {
        console.log("Database connected successfully.");
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });

module.exports = db;