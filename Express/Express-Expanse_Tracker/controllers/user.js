// controllers/user.js
import path from "node:path";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const userController = {
  getRegisterForm: function (req, res) {
    res.sendFile(path.join(import.meta.dirname, "..", "public", "register.html"));
  },

  getLoginForm: function (req, res) {
    res.sendFile(path.join(import.meta.dirname, "public", "login.html"));
  },

  addUserData: async function (req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match.");
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const result = await User.create({
        name,
        email,
        password: hashPassword,
      });

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
        attributes: ["id", "email", "password"],
      });
      if (!user) {
        // No account with that e‑mail
        // return res.status(401).json({ error: "Invalid credentials." });
        return res.status(404).send("User Not Found");
      }
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      console.log("Comparing ::", password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).send("Invalid email or password.");
      }

      res.status(200).send("User Login Successfull.");
      // res.status(200).json({
      //   message: "Login successful",
      //   user: { id: user.id, email: user.email },
      // });
    } catch (error) {
      console.error("Login error:", err);
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  },
};

export default userController;
