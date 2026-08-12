const express = require("express");

const db = require("./utils/db-connection");

// IMPORTANT: Import the model
const Student = require("./models/students");

const studentRoutes = require("./routes/studentsRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use("/students", studentRoutes);

db.sync({ force: true })
    .then(() => {
        console.log("Students table created successfully.");

        app.listen(3000, () => {
            console.log("Server is running");
        });
    })
    .catch((err) => {
        console.error("Database synchronization error:", err);
    });