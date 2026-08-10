const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const publicRoutes = require("./routes/public.routes");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: "*",
    credentials: true
}));

// Body Parser
app.use(express.json({
    limit: "10mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));

app.use(publicRoutes);


// Cookie Parser
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

// Static Files
app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"))
);

// API
app.use("/api/v1", routes);

// 404
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// Error Handler
app.use(errorHandler);

module.exports = app;