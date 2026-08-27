// index.js
import express from "express";
import path from "node:path";
import sequelize from "./config/db.js";

import userRouter from "./routes/user.js";

const app = express();
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.json());

app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome Page!");
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
