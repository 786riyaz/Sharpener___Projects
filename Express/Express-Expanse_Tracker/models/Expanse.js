import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
const Expanse = sequelize.define(
  "Expanse",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // Optional short note/comment about this expense. Added via the
    // migrations/<timestamp>-add-note-to-expanses migration - keep this
    // model definition in sync with that migration.
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Links every expense to the user who created it. Set by the
    // association below (User.hasMany / Expanse.belongsTo) in models/index.js.
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "expanses",
    timestamps: true,
  },
);
export default Expanse;
