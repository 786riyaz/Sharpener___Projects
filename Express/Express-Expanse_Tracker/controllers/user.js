// controllers/user.js
import path from "node:path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";
const userController = {
getRegisterForm: function (req, res) {
res.sendFile(path.join(import.meta.dirname, "..", "public", "register.html"));
},
getLoginForm: function (req, res) {
res.sendFile(path.join(import.meta.dirname, "..", "public", "login.html"));
},
addUserData: async function (req, res) {
try {
const { name, email, password, confirmPassword } = req.body;
if (!name || !email || !password || !confirmPassword) {
return res.status(400).send("All fields are required.");
}
if (password !== confirmPassword) {
return res.status(400).send("Passwords do not match.");
}
const hashPassword = await bcrypt.hash(password, 10);
await User.create({ name, email, password: hashPassword });
res.status(201).send("User Registration Completed.");
} catch (error) {
console.error(error);
if (error.name === "SequelizeUniqueConstraintError") {
return res.status(409).send("Email already registered.");
}
res.status(500).send("User Registration Failed.");
}
},
userLogin: async function (req, res) {
try {
const { email, password } = req.body;
if (!email || !password) {
return res.status(400).json({ error: "Email and password are required." });
}
const user = await User.findOne({
where: { email },
attributes: ["id", "name", "email", "password"],
});
if (!user) {
return res.status(404).send("User Not Found");
}
const isPasswordCorrect = await bcrypt.compare(password, user.password);
if (!isPasswordCorrect) {
return res.status(401).send("Invalid email or password.");
}
// Log the user in by issuing a signed JWT and storing it as an
// httpOnly cookie. The browser sends this cookie automatically on
// every later request - the server never has to remember anything
// itself (unlike sessions), it just verifies the token each time.
const token = jwt.sign(
{ userId: user.id, name: user.name },
JWT_SECRET,
{ expiresIn: JWT_EXPIRES_IN },
);
res.cookie("token", token, {
httpOnly: true, // not readable/writable from JS in the browser - protects against XSS token theft
sameSite: "lax",
maxAge: 1000 * 60 * 60 * 24, // 1 day, matches JWT_EXPIRES_IN
});
res.status(200).json({
message: "Login successful",
user: { id: user.id, name: user.name, email: user.email },
});
} catch (error) {
console.error("Login error:", error);
res.status(500).json({ error: "An unexpected error occurred." });
}
},
logout: function (req, res) {
res.clearCookie("token");
res.status(200).json({ message: "Logged out successfully." });
},
// The frontend calls this on page load to decide whether to show
// the expense dashboard or bounce the visitor to the login page.
checkSession: async function (req, res) {
const token = req.cookies.token;
if (!token) {
return res.status(200).json({ loggedIn: false });
}
try {
const decoded = jwt.verify(token, JWT_SECRET);
// isPremium can change after the token was issued (e.g. a purchase
// completes mid-session), so read it fresh from the DB each time
// rather than trusting whatever was baked into the JWT at login.
const user = await User.findByPk(decoded.userId, {
attributes: ["id", "name", "isPremium"],
});
if (!user) {
return res.status(200).json({ loggedIn: false });
}
// A user might close the tab mid-checkout and never get redirected
// back to trigger /payment/verify. Catch those here too, so a
// 10-minute-old PENDING order doesn't sit there forever.
await Order.update(
{ status: "FAILED" },
{
where: {
userId: user.id,
status: "PENDING",
expiresAt: { [Op.lt]: new Date() },
},
},
);
return res.status(200).json({
loggedIn: true,
user: { id: user.id, name: user.name, isPremium: user.isPremium },
});
} catch (error) {
return res.status(200).json({ loggedIn: false });
}
},
};
export default userController;
