import "dotenv/config"; // loads CASHFREE_APP_ID / CASHFREE_SECRET_KEY etc. from .env
import express from "express";
import path from "node:path";
import cookieParser from "cookie-parser";
import sequelize from "./models/index.js"; // also registers the User <-> Expanse association
import userRouter from "./routes/user.js";
import expanseRouter from "./routes/expanse.js";
import paymentRouter from "./routes/payment.js";
import premiumRouter from "./routes/premium.js";
import passwordRouter from "./routes/password.js";
const app = express();
app.use(express.json());
// Lets Express read the httpOnly "token" cookie (containing the JWT) off
// incoming requests, via req.cookies.token.
app.use(cookieParser());
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
app.use("/payment", paymentRouter);
app.use("/premium", premiumRouter);
app.use("/password", passwordRouter);
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
    await sequelize.sync();
    // await sequelize.sync({ alter: true });
    // await sequelize.sync({ force: true });
    console.log("Tables synchronized successfully.");
    app.listen(3001, () => {
      console.log("Server is running on port 3001");
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
}
startServer();
