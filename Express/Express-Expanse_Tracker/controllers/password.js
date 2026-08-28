import logger from "../utils/logger.js";
// controllers/password.js
import path from "node:path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import ForgotPasswordRequest from "../models/ForgotPasswordRequest.js";
import transporter from "../config/mailer.js";
// Where the frontend reset-password page lives. Override in .env for
// production (e.g. https://your-domain.com).
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3001";
const passwordController = {
// POST /password/forgotpassword  { email }
// Always responds with the same generic message whether or not the
// email exists, so this endpoint can't be used to find out which
// emails are registered.
forgotPassword: async function (req, res) {
try {
const { email } = req.body;
if (!email) {
return res.status(400).json({ error: "Email is required." });
}
const genericResponse = {
message: "If that email is registered, a password reset link has been sent.",
};
const user = await User.findOne({ where: { email } });
if (!user) {
// Don't leak whether the email exists.
return res.status(200).json(genericResponse);
}
// Generate a UUID with the `uuid` package (not sequelize's own
// UUIDV4 default) and store it as the request's primary key. It's
// long/random enough that nobody can guess another user's link.
const requestId = uuidv4();
await ForgotPasswordRequest.create({
id: requestId,
userId: user.id,
isActive: true,
});
const resetLink = `${APP_BASE_URL}/password/resetpassword/${requestId}`;
try {
await transporter.sendMail({
from: process.env.SMTP_USER,
to: user.email,
subject: "Reset your Expanse Tracker password",
text: `Hi ${user.name},\n\nWe received a request to reset your password. Click the link below to choose a new one:\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
html: `
<p>Hi ${user.name},</p>
<p>We received a request to reset your password. Click the button below to choose a new one:</p>
<p><a href="${resetLink}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a></p>
<p>Or copy this link into your browser:<br>${resetLink}</p>
<p>If you didn't request this, you can safely ignore this email.</p>
`,
});
} catch (mailError) {
logger.error("Failed to send reset email:", { error: mailError?.message || mailError, stack: mailError?.stack });
// Don't reveal mail-sending failures to the client either -
// still return the generic response.
}
// Handy in dev / if SMTP isn't configured yet: the link still works,
// you just have to grab it from the server log instead of an inbox.
logger.info("Password reset link:", resetLink);
return res.status(200).json(genericResponse);
} catch (error) {
logger.error("Forgot password error:", { error: error?.message || error, stack: error?.stack });
res.status(500).json({ error: "Something went wrong. Please try again." });
}
},
// GET /password/resetpassword/:id
// This is what the link in the email points to. Looks up the request
// by its UUID; if it exists and is still active, serve the "set a new
// password" form. Otherwise bounce back to login with an error flag.
getResetForm: async function (req, res) {
try {
const { id } = req.params;
const request = await ForgotPasswordRequest.findOne({ where: { id } });
if (!request || !request.isActive) {
return res.redirect("/login.html?resetError=invalid");
}
return res.sendFile(path.join(import.meta.dirname, "..", "public", "reset-password.html"));
} catch (error) {
logger.error("Get reset form error:", { error: error?.message || error, stack: error?.stack });
res.redirect("/login.html?resetError=invalid");
}
},
// POST /password/resetpassword/:id  { password, confirmPassword }
resetPassword: async function (req, res) {
try {
const { id } = req.params;
const { password, confirmPassword } = req.body;
if (!password || !confirmPassword) {
return res.status(400).json({ error: "All fields are required." });
}
if (password !== confirmPassword) {
return res.status(400).json({ error: "Passwords do not match." });
}
if (password.length < 6) {
return res.status(400).json({ error: "Password must be at least 6 characters." });
}
const request = await ForgotPasswordRequest.findOne({ where: { id } });
if (!request || !request.isActive) {
return res.status(400).json({ error: "That reset link is invalid or has expired." });
}
const user = await User.findByPk(request.userId);
if (!user) {
return res.status(400).json({ error: "That reset link is invalid or has expired." });
}
// Encrypt the password before saving it.
user.password = await bcrypt.hash(password, 10);
await user.save();
// The link is single-use - deactivate it so it can't be replayed.
request.isActive = false;
await request.save();
return res.status(200).json({ message: "Password has been reset. You can now log in." });
} catch (error) {
logger.error("Reset password error:", { error: error?.message || error, stack: error?.stack });
res.status(500).json({ error: "Something went wrong. Please try again." });
}
},
};
export default passwordController;
