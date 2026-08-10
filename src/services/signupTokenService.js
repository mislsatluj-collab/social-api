const jwt = require("jsonwebtoken");
const env = require("../config/env");

// Generate Signup Token
const generateSignupToken = (email) => {
    return jwt.sign(
        {
            email
        },
        env.SIGNUP_TOKEN_SECRET,
        {
            expiresIn: env.SIGNUP_TOKEN_EXPIRES_IN
        }
    );
};

// Verify Signup Token
const verifySignupToken = (token) => {
    return jwt.verify(token, env.SIGNUP_TOKEN_SECRET);
};

module.exports = {
    generateSignupToken,
    verifySignupToken
};