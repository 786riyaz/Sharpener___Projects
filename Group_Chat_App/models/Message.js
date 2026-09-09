const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        roomId: {
            type: String,
            default: null,
            index: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["group", "personal"],
            default: "group"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Message", messageSchema);
