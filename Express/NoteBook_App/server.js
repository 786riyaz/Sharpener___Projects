import db from "./db/database.js";

import Note from "./models/notes.js";

import app from "./app.js";

const PORT = 3000;

const startServer = async () => {
  try {
    await db.sync();

    console.log("Notes table synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

startServer();
