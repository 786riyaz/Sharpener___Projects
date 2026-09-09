const User = require("../../models/User");
const Message = require("../../models/Message");

function normalizeEmail(email) {
    return String(email || "")
        .trim()
        .toLowerCase();
}

/*
A personal room ID is deterministic.

Example:
    jack@example.com + asif@example.com

Both users calculate the same room ID because the emails are sorted:

    personal:asif@example.com|jack@example.com
*/
function createPersonalRoomId(emailA, emailB) {
    return `personal:${[normalizeEmail(emailA), normalizeEmail(emailB)]
        .sort()
        .join("|")}`;
}

function getRoomParticipants(roomId) {
    const value = String(roomId || "");

    if (!value.startsWith("personal:")) {
        return [];
    }

    return value
        .slice("personal:".length)
        .split("|")
        .map(normalizeEmail)
        .filter(Boolean);
}

function validatePersonalRoom(roomId, currentEmail) {
    const participants = getRoomParticipants(roomId);

    if (participants.length !== 2) {
        return {
            valid: false,
            message: "Invalid personal room ID"
        };
    }

    if (participants[0] === participants[1]) {
        return {
            valid: false,
            message: "A personal chat requires two different users"
        };
    }

    if (!participants.includes(normalizeEmail(currentEmail))) {
        return {
            valid: false,
            message: "You are not a participant of this room"
        };
    }

    return {
        valid: true,
        participants
    };
}

module.exports = function personalChatHandler(socket, io) {
    /*
    Exercise 12:
    The client explicitly asks to join a personal conversation room.

    Before joining a new room, the previously selected personal room is left.
    This prevents the socket from staying subscribed to old conversations.
    */
    const joinRoom = async (roomId, callback) => {
        try {
            const currentEmail =
                normalizeEmail(socket.data.user.email);

            const validation =
                validatePersonalRoom(roomId, currentEmail);

            if (!validation.valid) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: validation.message
                    });
                }

                return;
            }

            const otherEmail =
                validation.participants.find(
                    (email) => email !== currentEmail
                );

            const otherUser =
                await User.findOne({
                    email: otherEmail
                }).select("_id name email");

            if (!otherUser) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: "Other user not found"
                    });
                }

                return;
            }

            const previousRoom =
                socket.data.currentRoom;

            if (
                previousRoom &&
                previousRoom !== roomId
            ) {
                socket.leave(previousRoom);
            }

            socket.join(roomId);
            socket.data.currentRoom = roomId;

            console.log(
                `${currentEmail} joined personal room: ${roomId}`
            );

            if (typeof callback === "function") {
                callback({
                    success: true,
                    roomId,
                    previousRoom: previousRoom || null
                });
            }
        } catch (error) {
            console.log(
                "Join personal room error:",
                error
            );

            if (typeof callback === "function") {
                callback({
                    success: false,
                    message: "Unable to join room"
                });
            }
        }
    };

    // Exercise 13 uses join_room. The old join-room alias is retained
    // so previous exercise code does not break.
    socket.on("join_room", joinRoom);
    socket.on("join-room", joinRoom);

    /*
    Exercise 13:
    Explicitly leave the current personal room.
    */
    const leaveRoom = (roomId, callback) => {
        const currentEmail =
            normalizeEmail(socket.data.user.email);

        const validation =
            validatePersonalRoom(roomId, currentEmail);

        if (!validation.valid) {
            if (typeof callback === "function") {
                callback({
                    success: false,
                    message: validation.message
                });
            }

            return;
        }

        socket.leave(roomId);

        if (socket.data.currentRoom === roomId) {
            socket.data.currentRoom = null;
        }

        console.log(
            `${currentEmail} left personal room: ${roomId}`
        );

        if (typeof callback === "function") {
            callback({
                success: true,
                roomId
            });
        }
    };

    socket.on("leave_room", leaveRoom);
    socket.on("leave-room", leaveRoom);

    /*
    Exercise 12:
    Store the personal message in MongoDB and emit it only to
    the selected personal room.
    */
    socket.on(
        "new-message",
        async ({ message, roomId }, callback) => {
            try {
                const text =
                    String(message || "").trim();

                if (!text) {
                    if (typeof callback === "function") {
                        callback({
                            success: false,
                            message: "Message cannot be empty"
                        });
                    }

                    return;
                }

                const currentEmail =
                    normalizeEmail(socket.data.user.email);

                const validation =
                    validatePersonalRoom(
                        roomId,
                        currentEmail
                    );

                if (!validation.valid) {
                    if (typeof callback === "function") {
                        callback({
                            success: false,
                            message: validation.message
                        });
                    }

                    return;
                }

                if (
                    socket.data.currentRoom !== roomId ||
                    !socket.rooms.has(roomId)
                ) {
                    if (typeof callback === "function") {
                        callback({
                            success: false,
                            message:
                                "Join the personal room before sending a message"
                        });
                    }

                    return;
                }

                const receiverEmail =
                    validation.participants.find(
                        (email) =>
                            email !== currentEmail
                    );

                const receiver =
                    await User.findOne({
                        email: receiverEmail
                    }).select("_id name email");

                if (!receiver) {
                    if (typeof callback === "function") {
                        callback({
                            success: false,
                            message: "Receiver not found"
                        });
                    }

                    return;
                }

                const newMessage =
                    await Message.create({
                        sender:
                            socket.data.user.userId,
                        receiver: receiver._id,
                        roomId,
                        message: text,
                        type: "personal"
                    });

                const payload = {
                    id: newMessage._id,
                    sender:
                        socket.data.user.userId,
                    senderEmail: currentEmail,
                    receiver: receiver._id,
                    receiverEmail,
                    roomId,
                    message: newMessage.message,
                    type: "personal",
                    createdAt:
                        newMessage.createdAt
                };

                /*
                Only sockets that joined this exact room receive
                the real-time message.
                */
                io.to(roomId).emit(
                    "chat-message",
                    payload
                );

                if (typeof callback === "function") {
                    callback({
                        success: true,
                        message:
                            "Personal message sent successfully",
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
                        message:
                            "Unable to send personal message"
                    });
                }
            }
        }
    );
};

module.exports.createPersonalRoomId =
    createPersonalRoomId;
