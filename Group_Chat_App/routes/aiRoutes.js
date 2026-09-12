const express = require("express");
const Message = require("../models/Message");
const Group = require("../models/Group");
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");
const { normalizeEmail, createPersonalRoomId } = require("../utils/room");
const { isAiEnabled, getPredictiveSuggestions, getSmartReplies } = require("../services/geminiService");
const router = express.Router();
function clampText(value, max) {
return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}
async function canAccessRoom(user, roomId) {
if (!roomId) return false;
if (roomId.startsWith("group:")) {
const group = await Group.exists({ roomId, members: user.userId });
return Boolean(group);
}
const parts = roomId.split("::").map(normalizeEmail).filter(Boolean);
if (parts.length !== 2 || !parts.includes(normalizeEmail(user.email))) return false;
if (createPersonalRoomId(parts[0], parts[1]) !== roomId) return false;
const count = await User.countDocuments({ email: { $in: parts } });
return count === 2;
}
async function getAiContext(userId, roomId) {
const messages = await Message.find({ roomId })
.populate("sender", "name email")
.sort({ createdAt: -1 })
.limit(10)
.lean();
messages.reverse();
const context = messages.map((message) => {
const who = String(message.sender?._id || message.sender) === String(userId)
? "Me"
: (message.sender?.name || "Other user");
const content = message.text || (message.media?.originalName ? `[Shared ${message.media.originalName}]` : "[Media]");
return `${who}: ${clampText(content, 220)}`;
}).join("\n") || "No earlier messages.";
// Fetch the current user's own recent messages separately. The last room context
// can contain mostly other users' messages, which is not enough to personalize tone.
const myMessages = await Message.find({ roomId, sender: userId, text: { $ne: "" } })
.sort({ createdAt: -1 })
.limit(8)
.select("text createdAt")
.lean();
myMessages.reverse();
const myRecent = myMessages
.map((message) => clampText(message.text, 160))
.filter(Boolean);
const style = myRecent.length
? `Examples of my recent messages (copy the natural language, tone and emoji style when useful): ${myRecent.join(" | ")}`
: "No established style yet. Use the language of the current conversation and a natural, friendly, concise tone.";
return { context, style };
}
router.get("/status", authenticateToken, (req, res) => {
res.json({ success: true, enabled: isAiEnabled() });
});
router.post("/predict", authenticateToken, async (req, res) => {
try {
if (!isAiEnabled()) return res.json({ success: true, enabled: false, suggestions: [] });
const roomId = clampText(req.body.roomId, 300);
const draft = clampText(req.body.draft, 500);
if (!roomId || draft.length < 3) return res.json({ success: true, enabled: true, suggestions: [] });
if (!(await canAccessRoom(req.user, roomId))) return res.status(403).json({ success: false, message: "You are not allowed to use AI in this room" });
const { context, style } = await getAiContext(req.user.userId, roomId);
const result = await getPredictiveSuggestions({ draft, context, style });
return res.json({ success: true, enabled: result.available, suggestions: result.suggestions });
} catch (error) {
console.error("AI predictive typing error:", error.message);
return res.status(502).json({ success: false, message: "AI suggestions are temporarily unavailable" });
}
});
router.post("/smart-replies", authenticateToken, async (req, res) => {
try {
if (!isAiEnabled()) return res.json({ success: true, enabled: false, replies: [] });
const roomId = clampText(req.body.roomId, 300);
const incomingMessage = clampText(req.body.message, 1000);
if (!roomId || !incomingMessage) return res.status(400).json({ success: false, message: "roomId and message are required" });
if (!(await canAccessRoom(req.user, roomId))) return res.status(403).json({ success: false, message: "You are not allowed to use AI in this room" });
const { context, style } = await getAiContext(req.user.userId, roomId);
const result = await getSmartReplies({ incomingMessage, context, style });
return res.json({ success: true, enabled: result.available, replies: result.replies });
} catch (error) {
console.error("AI smart reply error:", error.message);
return res.status(502).json({ success: false, message: "AI smart replies are temporarily unavailable" });
}
});
module.exports = router;