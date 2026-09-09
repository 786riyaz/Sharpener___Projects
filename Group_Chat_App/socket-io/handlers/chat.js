const Message = require("../../models/Message");

function chatHandler(socket, io) {
    socket.on("sendMessage", async (messageData) => {
        try {
            const messageText = messageData?.message;

            if (!messageText || !messageText.trim()) {
                socket.emit("messageError", {
                    message: "Message cannot be empty"
                });
                return;
            }

            const newMessage = await Message.create({
                userId: socket.userId,
                message: messageText.trim()
            });

            const payload = {
                _id: newMessage._id,
                userId: newMessage.userId,
                message: newMessage.message,
                createdAt: newMessage.createdAt
            };

            // Sends the saved message to every connected client,
            // including the sender.
            io.emit("receiveMessage", payload);
        } catch (error) {
            console.error("Socket sendMessage error:", error);

            socket.emit("messageError", {
                message: "Unable to send message"
            });
        }
    });
}

module.exports = chatHandler;
