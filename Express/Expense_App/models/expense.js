import { DataTypes } from "sequelize";
import db from "../db/database.js";

const Expense = db.define(
  "Expense",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    Description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    Amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },

    Category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },

    ExpenseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  },
  {
    tableName: "Expenses",
    timestamps: true
  }
);

export default Expense;
