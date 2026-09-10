require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const User = require("./models/User");
const Group = require("./models/Group");
const authenticateToken = require("./middleware/auth");
const { upload, MAX_FILE_SIZE } = require("./middleware/upload");
const { uploadMedia } = require("./services/s3");
const Message = require("./models/Message");
const registerChatHandlers = require("./socket/handlers/chat");
const { normalizeEmail, createPersonalRoomId } = require("./utils/room");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection error:", error.message));

// ---------------- AUTH ----------------

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: String(phone).trim() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or phone number"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
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
      success: false,
      message: "Internal server error"
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Login and password are required"
      });
    }

    const loginValue = String(login).trim();

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

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
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
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ---------------- USER VALIDATION ----------------

app.get("/api/users/exists", authenticateToken, async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email }).select("_id name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("User validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ---------------- GROUPS ----------------

app.post("/api/groups", authenticateToken, async (req, res) => {
  try {
    const { name, memberEmails = [] } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required"
      });
    }

    const normalizedEmails = [
      req.user.email,
      ...memberEmails.map(normalizeEmail)
    ].filter(Boolean);

    const uniqueEmails = [...new Set(normalizedEmails)];

    const users = await User.find({
      email: { $in: uniqueEmails }
    }).select("_id email");

    if (users.length !== uniqueEmails.length) {
      const foundEmails = new Set(users.map((user) => user.email));
      const missingEmails = uniqueEmails.filter((email) => !foundEmails.has(email));

      return res.status(400).json({
        success: false,
        message: `These users do not exist: ${missingEmails.join(", ")}`
      });
    }

    const memberIds = users.map((user) => user._id);

    const group = new Group({
      name: String(name).trim(),
      roomId: `group:${new mongoose.Types.ObjectId().toString()}`,
      createdBy: req.user.userId,
      members: memberIds
    });

    await group.save();
    await group.populate("members", "name email");

    return res.status(201).json({
      success: true,
      group
    });
  } catch (error) {
    console.error("Create group error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create group"
    });
  }
});

app.get("/api/groups", authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.userId
    })
      .populate("members", "name email")
      .sort({ updatedAt: -1, createdAt: -1 });

    return res.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error("Get groups error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load groups"
    });
  }
});


// ---------------- MEDIA UPLOAD (AWS S3 + SOCKET.IO) ----------------

// The client uses this endpoint only for a user-facing upload limit. The
// server-side multer limit remains the source of truth.
app.get("/api/media/config", authenticateToken, (req, res) => {
  res.json({
    success: true,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: 10
  });
});


app.post("/api/media/upload", authenticateToken, upload.single("media"), async (req, res) => {
  try {
    const roomId = String(req.body.roomId || "").trim();
    const chatType = String(req.body.chatType || "").trim();
    const groupId = String(req.body.groupId || "").trim() || null;
    const caption = String(req.body.caption || "").trim();

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Media file is required" });
    }

    if (!roomId || !chatType) {
      return res.status(400).json({ success: false, message: "roomId and chatType are required" });
    }

    if (caption.length > 2000) {
      return res.status(400).json({ success: false, message: "Caption is too long" });
    }

    if (chatType === "personal") {
      const parts = roomId.split("::").map(normalizeEmail).filter(Boolean);
      if (parts.length !== 2 || !parts.includes(req.user.email)) {
        return res.status(403).json({ success: false, message: "You are not allowed to upload to this personal room" });
      }

      const [firstUser, secondUser] = parts;
      if (createPersonalRoomId(firstUser, secondUser) !== roomId) {
        return res.status(400).json({ success: false, message: "Invalid personal room ID" });
      }

      const users = await User.countDocuments({ email: { $in: parts } });
      if (users !== 2) {
        return res.status(400).json({ success: false, message: "Both users must exist before media can be shared" });
      }
    } else if (chatType === "group") {
      if (!groupId) {
        return res.status(400).json({ success: false, message: "groupId is required for a group upload" });
      }

      const group = await Group.findOne({
        _id: groupId,
        roomId,
        members: req.user.userId
      }).select("_id");

      if (!group) {
        return res.status(403).json({ success: false, message: "You are not allowed to upload to this group" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid chat type" });
    }

    const media = await uploadMedia(req.file);

    const message = await Message.create({
      chatType,
      roomId,
      groupId: groupId || null,
      sender: req.user.userId,
      text: caption,
      media
    });

    await message.populate("sender", "name email");

    // The HTTP upload finishes first. Then Socket.IO delivers the media message
    // only to the relevant personal/group room.
    io.to(roomId).emit("new_message", message);

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Media upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to upload media"
    });
  }
});

// Convert upload middleware errors into predictable JSON for the frontend.
app.use((error, req, res, next) => {
  if (!error) return next();

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: `Each file must be ${Math.floor(MAX_FILE_SIZE / (1024 * 1024))} MB or smaller`
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({ success: false, message: "Too many files selected" });
  }

  if (error.message === "This file type is not supported") {
    return res.status(415).json({ success: false, message: error.message });
  }

  return next(error);
});

// ---------------- SOCKET AUTH ----------------

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token is required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.data.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log(`Authenticated socket connected: ${socket.id} | ${socket.data.user.email}`);

  socket.emit("socket_authenticated", {
    success: true,
    user: socket.data.user
  });

  registerChatHandlers(io, socket);
});

// httpServer.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// Added 0.0.0.0 for render traffic 
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
