// controllers/password.js
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import User from "../models/User.js";
import transporter from "../config/mailer.js";

// How long a reset link stays valid.
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

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

      // Generate a random token. We store only its SHA-256 hash in the
      // DB (like a password) so a leaked database row can't be used
      // directly as a valid reset link.
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const resetLink = `${APP_BASE_URL}/reset-password.html?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: user.email,
          subject: "Reset your Expanse Tracker password",
          text: `Hi ${user.name},\n\nWe received a request to reset your password. Click the link below to choose a new one (valid for 30 minutes):\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
          html: `
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to choose a new one (valid for 30 minutes):</p>
            <p><a href="${resetLink}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a></p>
            <p>Or copy this link into your browser:<br>${resetLink}</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        });
      } catch (mailError) {
        console.error("Failed to send reset email:", mailError);
        // Don't reveal mail-sending failures to the client either -
        // still return the generic response.
      }

      return res.status(200).json(genericResponse);
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  },

  // POST /password/resetpassword  { email, token, password, confirmPassword }
  resetPassword: async function (req, res) {
    try {
      const { email, token, password, confirmPassword } = req.body;
      if (!email || !token || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required." });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
      }

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        where: {
          email,
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({ error: "That reset link is invalid or has expired." });
      }

      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(200).json({ message: "Password has been reset. You can now log in." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  },
};

export default passwordController;
