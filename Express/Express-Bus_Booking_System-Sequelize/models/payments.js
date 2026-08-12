import { DataTypes } from "sequelize";
import db from "../db/database.js";

const Payment = db.define(
  "Payment",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    AmountPaid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    PaymentStatus: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    tableName: "Payments",
    timestamps: false,
  },
);

export default Payment;
