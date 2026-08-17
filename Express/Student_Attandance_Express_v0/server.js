// server.js
import express from "express";
import path from "path";

import studentsRouter from "./routes/students.js";
import attandancesRouter from "./routes/attandances.js";

const app = express();
app.use(express.json()); 

app.use(express.static("public"));
// app.static(path.join(__dirname, "public"));

app.use("/students", studentsRouter);
app.use("/attandances", attandancesRouter);

app.get("/", (req, res) => {
  console.log("Home Page !");
});

app.listen(3000, (req, res) => {
  console.log("Server is running on port 3000!");
});
