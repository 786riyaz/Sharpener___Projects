import express from "express";

import usersRouter from "./routes/users.js";
import busesRouter from "./routes/buses.js";

const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/buses", busesRouter);

app.get("/", (req, res) => {
  res.send("GSRTC Bus Booking API is running");
});

export default app;