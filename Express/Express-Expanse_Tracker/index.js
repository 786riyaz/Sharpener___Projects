// index.js
import express from "express";
import path from "node:path";
import session from "express-session";
import sequelize from "./models/index.js"; // also registers the User <-> Expanse association
import userRouter from "./routes/user.js";
import expanseRouter from "./routes/expanse.js";

const app = express();

app.use(express.json());

// Session middleware - this is what lets the server "remember" a logged-in
// user between requests via a cookie, without the frontend managing tokens.
app.use(
  session({
    secret: "expanse-tracker-secret-key", // move this to an environment variable in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // session lasts 1 day
    },
  }),
);

app.use(express.static(path.join(import.meta.dirname, "public")));

app.use("/user", userRouter);
app.use("/expanse", expanseRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(import.meta.dirname, "public", "login.html"));
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    await sequelize.sync();
    console.log("Tables synchronized successfully.");
    app.listen(3001, () => {
      console.log("Server is running on port 3001");
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
}

startServer();
