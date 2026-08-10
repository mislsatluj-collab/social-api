const http = require("http");

const app = require("./app");

const env = require("./config/env");
const connectDB = require("./config/db");

const {
    initializeSocket
} = require("./config/socket");

const server = http.createServer(app);

// Database
connectDB();

// Socket
initializeSocket(server);

// Start Server
server.listen(env.PORT, () => {
    console.log(`
==================================
🚀 Misl Satluj Backend Started
🌐 Port : ${env.PORT}
==================================
`);
});