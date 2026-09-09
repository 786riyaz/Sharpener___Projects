const { Server } = require("socket.io");

const socketAuth = require("./middleware");
const chatHandler = require("./handlers/chat");

function setupSocketIO(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Socket authentication middleware
    socketAuth(io);

    io.on("connection", (socket) => {
        console.log(
            `Socket connected | userId=${socket.userId} | socketId=${socket.id}`
        );

        // Register chat-related socket events
        chatHandler(socket, io);

        socket.on("disconnect", (reason) => {
            console.log(
                `Socket disconnected | userId=${socket.userId} | socketId=${socket.id} | reason=${reason}`
            );
        });
    });

    return io;
}

module.exports = setupSocketIO;
