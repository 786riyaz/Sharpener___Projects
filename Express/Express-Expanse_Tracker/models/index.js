// models/index.js
import sequelize from "../config/db.js";
import User from "./User.js";
import Expanse from "./Expanse.js";

// Define the association: one user can have many expenses
User.hasMany(Expanse, {
  foreignKey: "userId",
  as: "expanses",
});
Expanse.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export { User, Expanse };
export default sequelize;
