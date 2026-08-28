// models/Expanse.js
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
