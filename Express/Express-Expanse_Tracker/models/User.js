// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
const User = sequelize.define(
"User",
{
id: {
type: DataTypes.INTEGER,
primaryKey: true,
autoIncrement: true,
},
name: {
type: DataTypes.STRING,
allowNull: false,
},
email: {
type: DataTypes.STRING,
allowNull: false,
unique: true,
},
password: {
type: DataTypes.STRING,
allowNull: false,
},
isPremium: {
type: DataTypes.BOOLEAN,
allowNull: false,
defaultValue: false,
},
// Denormalized running total of this user's expenses, kept in sync by
// expanseController.addExpanse / deleteExpanse (both update this inside
// the same DB transaction as the Expanse row). This lets the premium
// leaderboard read totals directly with no JOIN/SUM over the expanses
// table. Source of truth is still the expanses table in principle -
// this column is a cache, not a replacement.
totalExpense: {
type: DataTypes.FLOAT,
allowNull: false,
defaultValue: 0,
},
// Forgot-password flow: a random token (hashed) + its expiry get set
// when the user requests a reset email, and both are cleared again
// once the password is actually reset (or the token expires).
resetPasswordToken: {
type: DataTypes.STRING,
allowNull: true,
},
resetPasswordExpires: {
type: DataTypes.DATE,
allowNull: true,
},
},
{
tableName: "users",
timestamps: true,
},
);
export default User;
