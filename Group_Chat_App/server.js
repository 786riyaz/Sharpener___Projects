require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const http = require("http");

const User = require("./models/User");
const Message = require("./models/Message");
const setupSocketIO = require("./socket-io");

const app = express();
const httpServer = http.createServer(app);

// IMPORTANT:
// `io` is declared only once in this file.
// The actual Socket.IO implementation lives in ./socket-io/index.js.
const io = setupSocketIO(httpServer);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

function createToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// ---------------------------
// Authentication APIs
// ---------------------------

app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "Name, email, phone and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = phone.trim();

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { phone: normalizedPhone }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email or phone number already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            password: hashedPassword
        });

        const token = createToken(user._id.toString());

        return res.status(201).json({
            message: "Signup successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Unable to register user"
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                message: "Email/phone and password are required"
            });
        }

        const value = identifier.trim();

        const user = await User.findOne({
            $or: [
                { email: value.toLowerCase() },
                { phone: value }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = createToken(user._id.toString());

        return res.json({
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
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Unable to login"
        });
    }
});

// ---------------------------
// JWT middleware for HTTP APIs
// ---------------------------

function authenticateRequest(req, res, next) {
    try {
        const authorization = req.headers.authorization || "";
        const token = authorization.startsWith("Bearer ")
            ? authorization.slice(7)
            : null;

        if (!token) {
            return res.status(401).json({
                message: "Authentication token is required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// ---------------------------
// Message APIs
// ---------------------------

// Kept for earlier exercises.
// The frontend in this version sends new messages through Socket.IO.
app.post("/api/messages", authenticateRequest, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const newMessage = await Message.create({
            userId: req.userId,
            message: message.trim()
        });

        const payload = {
            _id: newMessage._id,
            userId: newMessage.userId,
            message: newMessage.message,
            createdAt: newMessage.createdAt
        };

        // If this HTTP endpoint is used, still make it live.
        io.emit("receiveMessage", payload);

        return res.status(201).json(payload);
    } catch (error) {
        console.error("Create message error:", error);

        return res.status(500).json({
            message: "Unable to save message"
        });
    }
});

app.get("/api/messages", authenticateRequest, async (req, res) => {
    try {
        const messages = await Message.find()
            .sort({ createdAt: 1 })
            .lean();

        return res.json(messages);
    } catch (error) {
        console.error("Get messages error:", error);

        return res.status(500).json({
            message: "Unable to fetch messages"
        });
    }
});

app.get("/api/health", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
