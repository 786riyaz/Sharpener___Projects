require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const http = require("http");

const User = require("./models/User");
const Message = require("./models/Message");
const authenticateToken =
    require("./middleware/auth");
const setupSocketIO =
    require("./socket_io");

const app = express();
const httpServer = http.createServer(app);

// IMPORTANT:
// Socket.IO is created only inside socket_io/index.js.
// This avoids the "Identifier 'io' has already been declared" error.
const io = setupSocketIO(httpServer);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log(
            "MongoDB connection error:",
            error.message
        );
    });


// SIGN UP
app.post("/api/signup", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await User.findOne({
                $or: [
                    { email: normalizedEmail },
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

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const newUser =
            await User.create({
                name: name.trim(),
                email: normalizedEmail,
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


// LOGIN
app.post("/api/login", async (req, res) => {
    try {
        const {
            login,
            password
        } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Login and password are required"
            });
        }

        const loginValue = login.trim();

        const user = await User.findOne({
            $or: [
                {
                    email:
                        loginValue.toLowerCase()
                },
                {
                    phone: loginValue
                }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email/phone or password"
            });
        }

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email/phone or password"
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


// SEARCH USERS FOR PERSONAL CHAT
app.get(
    "/api/users",
    authenticateToken,
    async (req, res) => {
        try {
            const search =
                String(
                    req.query.email || ""
                )
                    .trim()
                    .toLowerCase();

            const users = await User.find({
                _id: {
                    $ne: req.userId
                },
                ...(search
                    ? {
                        email: {
                            $regex: search,
                            $options: "i"
                        }
                    }
                    : {})
            })
                .select("_id name email")
                .sort({ name: 1 })
                .limit(20);

            return res.json({
                success: true,
                users
            });
        } catch (error) {
            console.log(
                "User search error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to search users"
            });
        }
    }
);


// GET PERSONAL MESSAGES
app.get(
    "/api/personal-messages/:email",
    authenticateToken,
    async (req, res) => {
        try {
            const otherUser =
                await User.findOne({
                    email:
                        req.params.email
                            .trim()
                            .toLowerCase()
                }).select("_id");

            if (!otherUser) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found"
                });
            }

            const messages =
                await Message.find({
                    type: "personal",
                    $or: [
                        {
                            sender: req.userId,
                            receiver:
                                otherUser._id
                        },
                        {
                            sender:
                                otherUser._id,
                            receiver: req.userId
                        }
                    ]
                })
                    .sort({ createdAt: 1 })
                    .limit(100)
                    .select(
                        "sender receiver message type createdAt"
                    );

            return res.json({
                success: true,
                messages
            });
        } catch (error) {
            console.log(
                "Get personal messages error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to get messages"
            });
        }
    }
);


// BACKWARD-COMPATIBLE REST GROUP MESSAGE API
app.post(
    "/api/messages",
    authenticateToken,
    async (req, res) => {
        try {
            const { message } = req.body;

            if (
                !message ||
                !message.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Message cannot be empty"
                });
            }

            const newMessage =
                await Message.create({
                    sender: req.userId,
                    message:
                        message.trim(),
                    type: "group"
                });

            io.emit(
                "newMessage",
                newMessage
            );

            return res.status(201).json({
                success: true,
                message:
                    "Message stored and broadcast successfully",
                chatMessage: newMessage
            });
        } catch (error) {
            console.log(
                "Create message error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Internal server error"
            });
        }
    }
);


// GET GROUP MESSAGES
app.get(
    "/api/messages",
    authenticateToken,
    async (req, res) => {
        try {
            const messages =
                await Message.find({
                    type: "group"
                })
                    .select(
                        "sender message createdAt"
                    )
                    .sort({
                        createdAt: 1
                    });

            return res.status(200).json({
                success: true,
                messages
            });
        } catch (error) {
            console.log(
                "Get messages error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Internal server error"
            });
        }
    }
);


// Start HTTP server.
// Do NOT use app.listen() because Socket.IO is attached
// to httpServer.
httpServer.listen(PORT, () => {
    console.log(
        `Socket.IO server running on http://localhost:${PORT}`
    );
});
