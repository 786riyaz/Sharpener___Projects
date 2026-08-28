import logger from "../utils/logger.js";
import User from "../models/User.js";
// Gates a route to premium users only. Reads isPremium fresh from the DB
// (not from the JWT) so an upgrade takes effect immediately, without the
// user needing to log out/in for a new token.
const isPremiumUser = async (req, res, next) => {
try {
const user = await User.findByPk(req.userId, { attributes: ["isPremium"] });
if (!user || !user.isPremium) {
return res.status(403).json({ error: "This feature is available to Premium members only." });
}
next();
} catch (error) {
logger.error("Premium check error:", { error: error?.message || error, stack: error?.stack });
res.status(500).json({ error: "Could not verify premium status." });
}
};
export default isPremiumUser;
