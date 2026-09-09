const jwt = require("jsonwebtoken");

function socketAuth(io) {
    io.use((socket, next) => {
        try {
            const authHeader = socket.handshake.auth || {};
            const token = authHeader.token;

            if (!token) {
                return next(new Error("Authentication error: Token not provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            socket.userId = decoded.userId;

            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });
}

module.exports = socketAuth;
