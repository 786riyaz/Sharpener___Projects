import express from "express";

import usersRouter from "./routes/users.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/users", usersRouter);

// Home route
app.get("/", (req, res) => {
  res.send("GSRTC Bus Booking API is running");
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
