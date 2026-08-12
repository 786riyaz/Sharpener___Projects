import express from "express";
import usersRouter from "./routes/users.js";
import busesRouter from "./routes/buses.js";
import bookingsRouter from "./routes/bookings.js";

const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/buses", busesRouter);
app.use("/bookings", bookingsRouter);

app.get("/", (req, res) => {
  res.json({
    message: "GSRTC Bus Booking API is running",
  });
});

export default app;
