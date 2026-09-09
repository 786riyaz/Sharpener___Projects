const jwt = require("jsonwebtoken");

module.exports = function socketAuth(io) {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(
                    new Error("Authentication token is required")
                );
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.data.user = {
                userId: decoded.userId,
                email: decoded.email
            };

            next();
        } catch (error) {
            console.log(
                "Socket authentication failed:",
                error.message
            );

            next(
                new Error("Invalid or expired token")
            );
        }
    });
};
