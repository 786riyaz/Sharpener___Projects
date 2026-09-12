const User = require("../../models/User");
const Group = require("../../models/Group");
const Message = require("../../models/Message");
const ArchivedChat = require("../../models/ArchivedChat");
const { normalizeEmail, createPersonalRoomId } = require("../../utils/room");
function respond(callback, payload) {
if (typeof callback === "function") {
callback(payload);
}
}
function registerChatHandlers(io, socket) {
socket.on("join_room", async (payload = {}, callback) => {
try {
const { roomId, chatType, groupId } = payload;
const userEmail = socket.data.user.email;
if (!roomId || !chatType) {
return respond(callback, {
success: false,
message: "roomId and chatType are required"
});
}
let validatedRoomId = roomId;
if (chatType === "personal") {
const otherEmail = normalizeEmail(payload.otherEmail);
if (!otherEmail) {
return respond(callback, {
success: false,
message: "Other user's email is required"
});
}
const otherUser = await User.findOne({ email: otherEmail }).select("_id name email");
if (!otherUser) {
return respond(callback, {
success: false,
message: "This email does not belong to an existing user"
});
}
validatedRoomId = createPersonalRoomId(userEmail, otherUser.email);
if (validatedRoomId !== roomId) {
return respond(callback, {
success: false,
message: "Invalid personal room ID"
});
}
}
if (chatType === "group") {
if (!groupId) {
return respond(callback, {
success: false,
message: "groupId is required for a group chat"
});
}
const group = await Group.findOne({
_id: groupId,
roomId,
members: socket.data.user.userId
}).select("_id name roomId");
if (!group) {
return respond(callback, {
success: false,
message: "You are not allowed to join this group"
});
}
validatedRoomId = group.roomId;
}
const previousRoom = socket.data.currentRoom;
if (previousRoom && previousRoom !== validatedRoomId) {
socket.leave(previousRoom);
}
socket.join(validatedRoomId);
socket.data.currentRoom = validatedRoomId;
socket.data.currentChatType = chatType;
socket.data.currentGroupId = groupId || null;
// Keep the active collection small, but merge recent active messages with
// archived history so users do not lose older chat history.
const [activeMessages, archivedMessages] = await Promise.all([
Message.find({ roomId: validatedRoomId })
.populate("sender", "name email")
.sort({ createdAt: -1 })
.limit(200),
ArchivedChat.find({ roomId: validatedRoomId })
.populate("sender", "name email")
.sort({ originalCreatedAt: -1 })
.limit(200)
]);
const normalizedArchived = archivedMessages.map((message) => ({
_id: message.originalMessageId,
chatType: message.chatType,
roomId: message.roomId,
groupId: message.groupId,
sender: message.sender,
text: message.text,
media: message.media,
createdAt: message.originalCreatedAt,
updatedAt: message.originalUpdatedAt,
archived: true
}));
const messages = [...activeMessages, ...normalizedArchived]
.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
.slice(-200);
respond(callback, {
success: true,
roomId: validatedRoomId,
previousRoom: previousRoom || null,
messages
});
} catch (error) {
console.error("join_room error:", error);
respond(callback, {
success: false,
message: error.message || "Unable to join room"
});
}
});
socket.on("leave_room", (payload = {}, callback) => {
const roomId = payload.roomId;
if (!roomId) {
return respond(callback, {
success: false,
message: "roomId is required"
});
}
socket.leave(roomId);
if (socket.data.currentRoom === roomId) {
socket.data.currentRoom = null;
socket.data.currentChatType = null;
socket.data.currentGroupId = null;
}
respond(callback, {
success: true,
roomId
});
});
socket.on("send_message", async (payload = {}, callback) => {
try {
const text = String(payload.text || "").trim();
const roomId = socket.data.currentRoom;
const chatType = socket.data.currentChatType;
const groupId = socket.data.currentGroupId;
if (!roomId || !chatType) {
return respond(callback, {
success: false,
message: "Join a chat room before sending a message"
});
}
if (!text) {
return respond(callback, {
success: false,
message: "Message cannot be empty"
});
}
if (text.length > 2000) {
return respond(callback, {
success: false,
message: "Message is too long"
});
}
const message = await Message.create({
chatType,
roomId,
groupId: groupId || null,
sender: socket.data.user.userId,
text
});
await message.populate("sender", "name email");
io.to(roomId).emit("new_message", message);
respond(callback, {
success: true,
message
});
} catch (error) {
console.error("send_message error:", error);
respond(callback, {
success: false,
message: "Unable to send message"
});
}
});
socket.on("disconnect", (reason) => {
console.log(`Socket disconnected: ${socket.id} | ${reason}`);
});
}
module.exports = registerChatHandlers;