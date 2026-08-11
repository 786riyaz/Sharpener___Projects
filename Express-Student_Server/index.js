import express from "express";
import studentRoutes from "./routes/students.js";
import courseRoutes from "./routes/courses.js";
const app = express();
const port = 3000;

app.use("/students", studentRoutes);
app.use("/courses", courseRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Student & Course Portal API!");
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
