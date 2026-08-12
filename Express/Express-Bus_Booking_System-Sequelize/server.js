import db from "./db/database.js";

// Import all models so Sequelize registers them
import User from "./models/users.js";
import Bus from "./models/buses.js";
import Booking from "./models/bookings.js";
import Payment from "./models/payments.js";

import app from "./app.js";

const PORT = 3000;

const startServer = async () => {
  try {
    await db.sync();

    console.log("All tables synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to synchronize database:", error);
  }
};

startServer();
