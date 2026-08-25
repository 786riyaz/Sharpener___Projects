// index.js
import express from "express";
import path from "node:path";
import sequelize from "./config/db.js";
import User from "./models/User.js";

const app = express();

app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome Page!");
});

app.get("/user/register", (req, res) => {
  res.sendFile(path.join(import.meta.dirname, "public", "register.html"));
});

app.post("/user/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match.");
    }

    const result = await User.create({
      name,
      email,
      password,
    });

    res.status(201).send("User Registration Completed.");
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).send("Email already registered.");
    }

    res.status(500).send("User Registration Failed.");
  }
});
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync();
    console.log("Tables synchronized successfully.");

    app.listen(3001, () => {
      console.log("Server is running on port 3001");
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
}

startServer();
