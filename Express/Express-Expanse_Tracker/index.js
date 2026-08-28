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
import requestLogger from "./middleware/requestLogger.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

// Fail fast if a required secret is missing, instead of silently signing
// tokens with `undefined` and shipping that to production.
if (!process.env.JWT_SECRET) {
  logger.error("Missing JWT_SECRET in .env - refusing to start.");
  process.exit(1);
}

const PORT = process.env.PORT || 3001;

const app = express();

// NOTE: no Helmet here on purpose - it enforces HTTPS, which breaks local
// dev without certificates. Add it back once this is deployed behind a
// real domain with HTTPS. No compression middleware either - this app
// isn't server-side rendered, so there's no HTML/asset payload worth
// compressing server-side.

app.use(requestLogger);
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

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info("Database connected successfully.");
    // alter: true lets Sequelize add/adjust columns on tables that already
    // exist (e.g. adding userId to an "expanses" table created before this
    // column existed). Fine for development; for production, use proper
    // migrations instead of alter/sync.
    await sequelize.sync();
    // await sequelize.sync({ alter: true });
    // await sequelize.sync({ force: true });
    logger.info("Tables synchronized successfully.");
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Unable to start server:", { error: error.message, stack: error.stack });
    // Winston's file transport writes asynchronously - give it a moment to
    // flush before the process dies, or the log file ends up empty.
    setTimeout(() => process.exit(1), 250);
  }
}

// Last-resort safety nets so an unexpected crash gets logged to file
// instead of just dying silently in a background process.
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception:", { error: err.message, stack: err.stack });
  setTimeout(() => process.exit(1), 250);
});
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", { reason: reason?.stack || reason });
});

startServer();
