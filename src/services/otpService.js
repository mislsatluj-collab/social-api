const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");

const OTP = require("../models/OTP");

const env = require("../config/env");
const { sendEmail } = require("./emailService");

const generateOTP = () => {
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true
    });
};

const sendOTP = async (email) => {
    await OTP.deleteMany({ email });

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await OTP.create({
        email,
        otp: hashedOTP,
        expiresAt: new Date(
            Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000
        )
    });

    await sendEmail({
        to: email,
        subject: "Your Misl Satluj Verification Code",
        text: `Your Misl Satluj verification code is ${otp}. It is valid for ${env.OTP_EXPIRY_MINUTES} minutes.`
    });

    return true;
};

module.exports = {
    sendOTP
};