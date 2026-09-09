require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

// ==========================================
// SIGN UP API
// ==========================================
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email.trim().toLowerCase() },
                { phone: phone.trim() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or phone number"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone
            }
        });

    } catch (error) {
        console.log("Signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ==========================================
// LOGIN API
// ==========================================
app.post("/api/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                success: false,
                message: "Login and password are required"
            });
        }

        const loginValue = login.trim();

        const user = await User.findOne({
            $or: [
                { email: loginValue.toLowerCase() },
                { phone: loginValue }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email/phone or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email/phone or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.log("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ==========================================
// CREATE CHAT MESSAGE API
// ==========================================
app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        const newMessage = await Message.create({
            sender: req.userId,
            message: message.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Message stored successfully",
            chatMessage: newMessage
        });

    } catch (error) {
        console.log("Create message error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
