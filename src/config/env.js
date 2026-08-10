const dotenv = require("dotenv");

dotenv.config();

const env = {
    // Server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    // Database
    MONGO_URI: process.env.MONGO_URI,

    // Access Token
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

    // Refresh Token
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN,

    // Signup Token
    SIGNUP_TOKEN_SECRET: process.env.SIGNUP_TOKEN_SECRET,
    SIGNUP_TOKEN_EXPIRES_IN: process.env.SIGNUP_TOKEN_EXPIRES_IN,

    // OTP
    OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES) || 5,

    // SMS
    SMS_PROVIDER: process.env.SMS_PROVIDER || "console",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

    // SMTP Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_MAIL: process.env.SMTP_MAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_SERVICE: process.env.SMTP_SERVICE,
    SMTP_FROM: process.env.SMTP_FROM
};

module.exports = env;