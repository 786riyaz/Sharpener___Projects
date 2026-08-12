import express from "express";
import dotenv from "dotenv";

import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/students", studentRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Student API is running",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[SERVER ERROR]", err);

  res.status(500).json({
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

/*
CREATE DATABASE schooldb;

USE schooldb;

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT NOT NULL
);
*/