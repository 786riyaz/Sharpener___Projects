import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
// Stores every "forgot password" request a user generates.
// - id: a UUID (long, unguessable string) instead of an auto-increment
//   int, so nobody can enumerate/guess another user's reset link. It is
//   generated explicitly with the `uuid` npm package in
//   controllers/password.js (uuidv4()), not by a DB default.
// - userId: which user asked for the reset (Many ForgotPasswordRequests
//   -> One User, see the association in models/index.js).
// - isActive: true until the link is used (or superseded); flipped to
//   false the moment the password is actually reset, so the same link
//   can't be replayed later.
const ForgotPasswordRequest = sequelize.define(
  "ForgotPasswordRequest",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "forgot_password_requests",
    timestamps: true,
  },
);
export default ForgotPasswordRequest;
