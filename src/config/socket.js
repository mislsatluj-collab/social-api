let io = null;

const initializeSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`🟢 Socket Connected: ${socket.id}`);

        socket.on("join", (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`🔗 Socket ${socket.id} joined room: ${userId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔴 Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized.");
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO
};