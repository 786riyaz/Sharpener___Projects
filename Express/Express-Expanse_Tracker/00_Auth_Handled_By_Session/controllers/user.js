// controllers/user.js
import path from "node:path";
import bcrypt from "bcrypt";
import User from "../models/User.js";

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

      // Log the user in by storing their id in the session.
      // Every later request that carries the session cookie is now "logged in".
      req.session.userId = user.id;
      req.session.userName = user.name;

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
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Could not log out." });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully." });
    });
  },

  // The frontend calls this on page load to decide whether to show
  // the expense dashboard or bounce the visitor to the login page.
  checkSession: function (req, res) {
    if (req.session && req.session.userId) {
      return res.status(200).json({
        loggedIn: true,
        user: { id: req.session.userId, name: req.session.userName },
      });
    }
    res.status(200).json({ loggedIn: false });
  },
};

export default userController;
