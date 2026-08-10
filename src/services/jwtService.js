const jwt = require("jsonwebtoken");
const env = require("../config/env");

// Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN
        }
    );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id
        },
        env.REFRESH_SECRET,
        {
            expiresIn: env.REFRESH_EXPIRES_IN
        }
    );
};

// Verify Access Token
const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.REFRESH_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};