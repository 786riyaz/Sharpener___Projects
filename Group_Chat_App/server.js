require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const httpServer = http.createServer(app);

// Socket.IO server attached to the HTTP server.
const io = new Server(httpServer);

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
// JWT AUTHENTICATION FOR REST APIs
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
// SOCKET.IO AUTHENTICATION MIDDLEWARE
// ==========================================
// The frontend sends the JWT while opening the Socket.IO connection:
//
// const socket = io("http://localhost:3000", {
//     auth: { token }
// });
//
// Socket.IO middleware runs BEFORE "connection".
// If authentication fails, the client never reaches the
// connection handler.
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(
                new Error("Authentication token is required")
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store the authenticated identity on the socket.
        // socket.data is the recommended place for custom
        // data associated with a Socket.IO connection.
        socket.data.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        // Kept as a convenient shortcut for the rest of this app.
        socket.userId = decoded.userId;

        next();

    } catch (error) {
        console.log("Socket authentication failed:", error.message);

        next(new Error("Invalid or expired token"));
    }
});

// ==========================================
// SOCKET.IO BACKEND
// ==========================================
io.on("connection", (socket) => {
    // This connection exists only after JWT authentication succeeds.
    const authenticatedUser = socket.data.user;

    console.log("Authenticated client connected");
    console.log("Socket ID:", socket.id);
    console.log("Authenticated User ID:", authenticatedUser.userId);
    console.log("Authenticated Email:", authenticatedUser.email);

    // Optional confirmation event. It also makes Socket Auth easy to test.
    socket.emit("socketAuthenticated", {
        success: true,
        user: authenticatedUser
    });

    // Listen for a message sent directly through Socket.IO.
    socket.on("sendMessage", async (messageText, callback) => {
        try {
            if (!messageText || !messageText.trim()) {
                const errorMessage = "Message cannot be empty";

                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: errorMessage
                    });
                }

                return;
            }

            // Store the message before broadcasting it.
            // IMPORTANT:
            // The sender is NOT accepted from the frontend.
            // It is taken from the authenticated socket identity.
            const newMessage = await Message.create({
                sender: socket.data.user.userId,
                message: messageText.trim()
            });

            // Send the new message to every connected client.
            io.emit("newMessage", newMessage);

            if (typeof callback === "function") {
                callback({
                    success: true,
                    message: "Message sent successfully",
                    chatMessage: newMessage
                });
            }

        } catch (error) {
            console.log("Socket sendMessage error:", error);

            if (typeof callback === "function") {
                callback({
                    success: false,
                    message: "Unable to send message"
                });
            }
        }
    });

    socket.on("disconnect", (reason) => {
        console.log(
            `Client disconnected: ${socket.id} | Reason: ${reason}`
        );
    });
});

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
                message:
                    "User already exists with this email or phone number"
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
// REST MESSAGE API
// Kept for backward compatibility with Exercise 4-7.
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

        // Broadcast to all connected Socket.IO clients.
        io.emit("newMessage", newMessage);

        return res.status(201).json({
            success: true,
            message: "Message stored and broadcast successfully",
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

// ==========================================
// GET ALL MESSAGES API
// ==========================================
app.get("/api/messages", authenticateToken, async (req, res) => {
    try {
        const messages = await Message.find()
            .select("sender message createdAt")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        console.log("Get messages error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// IMPORTANT:
// Start the HTTP server, not `app.listen()`.
// Socket.IO is attached to `httpServer`.
httpServer.listen(PORT, () => {
    console.log(
        `Server with Socket.IO is running on http://localhost:${PORT}`
    );
});
