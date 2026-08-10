const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },

        otp: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true,
            index: {
                expires: 0
            }
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("OTP", otpSchema);