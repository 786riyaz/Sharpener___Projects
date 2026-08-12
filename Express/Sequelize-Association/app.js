const express = require("express");

const sequelize = require("./utils/db-connection");

const userRoutes = require("./routes/userRoutes");

// IMPORTANT:
// Import models and associations before sync()
require("./models");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/users", userRoutes);

// Home
app.get("/", (req, res) => {
  res.send("One-to-Many Sequelize API is running");
});

// Database synchronization
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synchronized.");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Database synchronization failed:", error);
  });
