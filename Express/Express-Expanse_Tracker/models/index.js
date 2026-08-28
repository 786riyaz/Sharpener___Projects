import sequelize from "../config/db.js";
import User from "./User.js";
import Expanse from "./Expanse.js";
import Order from "./Order.js";
import ForgotPasswordRequest from "./ForgotPasswordRequest.js";
import Report from "./Report.js";
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
// One user can have many forgot-password requests
User.hasMany(ForgotPasswordRequest, {
foreignKey: "userId",
as: "forgotPasswordRequests",
});
ForgotPasswordRequest.belongsTo(User, {
foreignKey: "userId",
as: "user",
});
// One user can have many generated report files
User.hasMany(Report, {
foreignKey: "userId",
as: "reports",
});
Report.belongsTo(User, {
foreignKey: "userId",
as: "user",
});
export { User, Expanse, Order, ForgotPasswordRequest, Report };
export default sequelize;
