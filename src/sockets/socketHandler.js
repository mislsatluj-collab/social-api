const { getIO } = require("../config/socket");

const emitToAll = (event, data) => {
    const io = getIO();
    io.emit(event, data);
};

const emitToSocket = (socketId, event, data) => {
    const io = getIO();
    io.to(socketId).emit(event, data);
};

const emitToRoom = (room, event, data) => {
    const io = getIO();
    io.to(room).emit(event, data);
};

module.exports = {
    emitToAll,
    emitToSocket,
    emitToRoom
};