// models/index.js
import sequelize from "../config/db.js";
import User from "./User.js";
import Expanse from "./Expanse.js";
import Order from "./Order.js";

// One user can have many expenses
User.hasMany(Expanse, {
  foreignKey: "userId",
  as: "expanses",
});
Expanse.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// One user can have many orders (membership purchase attempts)
User.hasMany(Order, {
  foreignKey: "userId",
  as: "orders",
});
Order.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export { User, Expanse, Order };
export default sequelize;
