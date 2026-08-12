const express = require("express");
const sequelize = require("./utils/db-connection");
const studentRoutes = require("./routes/studentsRoutes");
const courseRoutes = require("./routes/courseRoutes");

// IMPORTANT: load models + associations BEFORE db.sync()
require("./models");

const app = express();
app.use(express.json());

app.use("/students", studentRoutes);
app.use("/courses", courseRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

// force:false -> will NOT drop existing tables, only creates them if missing
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synchronized successfully.");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Database synchronization failed:", error);
  });
