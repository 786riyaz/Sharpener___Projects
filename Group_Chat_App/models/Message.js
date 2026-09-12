const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
{
chatType: {
type: String,
enum: ["personal", "group"],
required: true
},
roomId: {
type: String,
required: true,
index: true
},
groupId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Group",
default: null
},
sender: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},
text: {
type: String,
default: "",
trim: true,
maxlength: 2000
},
media: {
key: { type: String, default: null },
url: { type: String, default: null },
originalName: { type: String, default: null },
mimeType: { type: String, default: null },
size: { type: Number, default: null }
}
},
{ timestamps: true }
);
messageSchema.index({ roomId: 1, createdAt: 1 });
module.exports = mongoose.model("Message", messageSchema);