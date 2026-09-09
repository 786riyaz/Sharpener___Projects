const User = require("../../models/User");
const Message = require("../../models/Message");

module.exports = function personalChatHandler(socket, io) {
    // Exercise 11:
    // Client emits this event after connecting.
    socket.on("join-room", (roomName, callback) => {
        const authenticatedEmail =
            socket.data.user.email.toLowerCase();

        const requestedRoom =
            String(roomName || "").toLowerCase();

        // A user can only join their own personal room.
        if (requestedRoom !== authenticatedEmail) {
            const response = {
                success: false,
                message: "You can only join your own personal room"
            };

            if (typeof callback === "function") {
                callback(response);
            }

            return;
        }

        socket.join(authenticatedEmail);

        console.log(
            `${authenticatedEmail} joined personal room: ${authenticatedEmail}`
        );

        if (typeof callback === "function") {
            callback({
                success: true,
                roomName: authenticatedEmail
            });
        }
    });


    // Exercise 11:
    // Send a message to a specific user's personal room.
    socket.on(
        "new-message",
        async ({ message, roomName }, callback) => {
            try {
                if (!message || !message.trim()) {
                    const response = {
                        success: false,
                        message: "Message cannot be empty"
                    };

                    if (typeof callback === "function") {
                        callback(response);
                    }

                    return;
                }

                const receiverEmail =
                    String(roomName || "")
                        .trim()
                        .toLowerCase();

                if (!receiverEmail) {
                    const response = {
                        success: false,
                        message: "Receiver email is required"
                    };

                    if (typeof callback === "function") {
                        callback(response);
                    }

                    return;
                }

                const receiver = await User.findOne({
                    email: receiverEmail
                }).select("_id name email");

                if (!receiver) {
                    const response = {
                        success: false,
                        message: "Receiver not found"
                    };

                    if (typeof callback === "function") {
                        callback(response);
                    }

                    return;
                }

                const newMessage = await Message.create({
                    sender: socket.data.user.userId,
                    receiver: receiver._id,
                    message: message.trim(),
                    type: "personal"
                });

                const payload = {
                    id: newMessage._id,
                    sender: socket.data.user.userId,
                    senderEmail: socket.data.user.email,
                    receiver: receiver._id,
                    receiverEmail,
                    message: newMessage.message,
                    type: "personal",
                    createdAt: newMessage.createdAt
                };

                // Receiver gets the message in their personal room.
                io.to(receiverEmail).emit(
                    "chat-message",
                    payload
                );

                // Sender also receives it in their own room.
                io.to(
                    socket.data.user.email.toLowerCase()
                ).emit(
                    "chat-message",
                    payload
                );

                if (typeof callback === "function") {
                    callback({
                        success: true,
                        message: "Personal message sent successfully",
                        chatMessage: payload
                    });
                }
            } catch (error) {
                console.log(
                    "Personal message error:",
                    error
                );

                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: "Unable to send personal message"
                    });
                }
            }
        }
    );
};
