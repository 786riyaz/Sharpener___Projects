import { DataTypes } from "sequelize";
import db from "../db/database.js";

const Bus = db.define(
  "Bus",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BusNumber: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    TotalSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    AvailableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Buses",
    timestamps: false,
  }
);

export default Bus;
