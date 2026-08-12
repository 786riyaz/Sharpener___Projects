import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import notesRouter from "./routes/notes.js";

const app = express();

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// API routes
app.use("/api/notes", notesRouter);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;
