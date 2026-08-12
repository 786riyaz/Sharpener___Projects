import User from "./users.js";
import Bus from "./buses.js";
import Booking from "./bookings.js";
import Payment from "./payments.js";

// User -> Booking: One-to-Many
User.hasMany(Booking, {
  foreignKey: "UserId",
  sourceKey: "Id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Booking.belongsTo(User, {
  foreignKey: "UserId",
  targetKey: "Id",
});

// Bus -> Booking: One-to-Many
Bus.hasMany(Booking, {
  foreignKey: "BusId",
  sourceKey: "Id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Booking.belongsTo(Bus, {
  foreignKey: "BusId",
  targetKey: "Id",
});

export { User, Bus, Booking, Payment };
