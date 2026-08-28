// middleware/auth.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
// Blocks access to a route unless the request carries a valid JWT
// (sent automatically as an httpOnly cookie by the browser).
const isAuthenticated = (req, res, next) => {
const token = req.cookies.token;
if (!token) {
return res.status(401).json({ error: "Please log in to continue." });
}
try {
const decoded = jwt.verify(token, JWT_SECRET);
req.userId = decoded.userId;
req.userName = decoded.name;
next();
} catch (error) {
return res.status(401).json({ error: "Session expired. Please log in again." });
}
};
export default isAuthenticated;
