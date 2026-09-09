const { Server } = require("socket.io");

const socketAuth = require("./middleware");
const chatHandler = require("./handlers/chat");
const personalChatHandler =
    require("./handlers/personal_chat");

module.exports = function setupSocketIO(server) {
    const io = new Server(server);

    // Exercise 9: Socket.IO authentication.
    socketAuth(io);

    io.on("connection", (socket) => {
        const user = socket.data.user;

        console.log("Authenticated client connected");
        console.log("Socket ID:", socket.id);
        console.log("Authenticated User ID:", user.userId);
        console.log("Authenticated Email:", user.email);

        socket.emit("socketAuthenticated", {
            success: true,
            user
        });

        // Exercise 10: modular event handlers.
        chatHandler(socket, io);
        personalChatHandler(socket, io);

        socket.on("disconnect", (reason) => {
            console.log(
                `Client disconnected: ${socket.id} | Reason: ${reason}`
            );
        });
    });

    return io;
};
