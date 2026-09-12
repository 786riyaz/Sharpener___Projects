const mongoose = require("mongoose");
const archivedChatSchema = new mongoose.Schema(
{
originalMessageId: {
type: mongoose.Schema.Types.ObjectId,
required: true,
unique: true,
index: true
},
chatType: { type: String, enum: ["personal", "group"], required: true },
roomId: { type: String, required: true, index: true },
groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
text: { type: String, default: "", trim: true, maxlength: 2000 },
media: {
key: { type: String, default: null },
url: { type: String, default: null },
originalName: { type: String, default: null },
mimeType: { type: String, default: null },
size: { type: Number, default: null }
},
originalCreatedAt: { type: Date, required: true, index: true },
originalUpdatedAt: { type: Date, required: true },
archivedAt: { type: Date, default: Date.now, index: true }
},
{ timestamps: false }
);
archivedChatSchema.index({ roomId: 1, originalCreatedAt: 1 });
module.exports = mongoose.model("ArchivedChat", archivedChatSchema);