// models/Order.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Our own order id, sent to Cashfree when creating the order and used
    // again later to look up payment status.
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // PENDING -> SUCCESS or FAILED, once the payment is attempted.
    status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    paymentSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Order is only valid for a fixed window after creation - matches the
    // order_expiry_time sent to Cashfree. Used to auto-fail stale PENDING
    // orders even if Cashfree itself still reports them as pending.
    // Nullable so it doesn't break older rows created before this column existed.
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  },
);

export default Order;
