const Message = require("../../models/Message");

module.exports = function chatHandler(socket, io) {
    socket.on("sendMessage", async (messageText, callback) => {
        try {
            if (
                !messageText ||
                !messageText.trim()
            ) {
                const errorMessage =
                    "Message cannot be empty";

                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: errorMessage
                    });
                }

                return;
            }

            const newMessage = await Message.create({
                sender: socket.data.user.userId,
                message: messageText.trim(),
                type: "group"
            });

            io.emit("newMessage", {
                id: newMessage._id,
                sender: socket.data.user.userId,
                message: newMessage.message,
                type: newMessage.type,
                createdAt: newMessage.createdAt
            });

            if (typeof callback === "function") {
                callback({
                    success: true,
                    message: "Message sent successfully",
                    chatMessage: newMessage
                });
            }
        } catch (error) {
            console.log(
                "Socket sendMessage error:",
                error
            );

            if (typeof callback === "function") {
                callback({
                    success: false,
                    message: "Unable to send message"
                });
            }
        }
    });
};
