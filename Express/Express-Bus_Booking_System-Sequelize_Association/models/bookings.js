import { DataTypes } from "sequelize";
import db from "../db/database.js";

const Booking = db.define(
  "Booking",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    SeatNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Foreign key to Users.Id
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Foreign key to Buses.Id
    BusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Bookings",
    timestamps: false,
  }
);

export default Booking;
