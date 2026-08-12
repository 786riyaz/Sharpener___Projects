const express = require("express");

const db = require("./utils/db-connection");

const studentRoutes = require("./routes/studentsRoutes");

// Import model so Sequelize knows about the table
require("./models/students");

const app = express();

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Hello world");
});

// Student routes
app.use("/students", studentRoutes);

// Sync database
db.sync()
  .then(() => {
    console.log("Database synchronized successfully.");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database synchronization failed:", err);
  });
