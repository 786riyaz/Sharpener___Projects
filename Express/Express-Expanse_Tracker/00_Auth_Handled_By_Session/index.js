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

app.use(
  express.static(path.join(import.meta.dirname, "public"), {
    setHeaders: (res, filePath) => {
      // Never cache the dashboard - it shows a logged-in user's private
      // data, so the browser must always re-check auth instead of
      // restoring an old snapshot via back/forward or bfcache.
      if (filePath.endsWith("dashboard.html")) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      }
    },
  }),
);

app.use("/user", userRouter);
app.use("/expanse", expanseRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(import.meta.dirname, "public", "login.html"));
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    // alter: true lets Sequelize add/adjust columns on tables that already
    // exist (e.g. adding userId to an "expanses" table created before this
    // column existed). Fine for development; for production, use proper
    // migrations instead of alter/sync.
    await sequelize.sync({ alter: true });
    console.log("Tables synchronized successfully.");
    app.listen(3001, () => {
      console.log("Server is running on port 3001");
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
}

startServer();
