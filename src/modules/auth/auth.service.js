const bcrypt = require("bcryptjs");

const OTP = require("../../models/OTP");
const User = require("../../models/User");
const RefreshToken = require("../../models/RefreshToken");

const { sendOTP } = require("../../services/otpService");

const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require("../../services/jwtService");

const {
    generateSignupToken,
    verifySignupToken
} = require("../../services/signupTokenService");

const {
    createUniqueLeaderCode
} = require("../../services/leaderCodeService");

const { generateLinksForVolunteer } = require("../tracking/tracking.service");

// Send OTP
const sendOTPService = async (email) => {

    await sendOTP(email);

    return {
        success: true,
        message: "OTP sent successfully."
    };

};

// Verify OTP
const verifyOTPService = async ({ email, otp }) => {

    const otpDoc = await OTP.findOne({ email });

    if (!otpDoc) {
        throw new Error("OTP not found.");
    }

    if (otpDoc.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otpDoc._id });
        throw new Error("OTP has expired.");
    }

    const validOTP = await bcrypt.compare(otp, otpDoc.otp);

    if (!validOTP) {
        throw new Error("Invalid OTP.");
    }

    await OTP.deleteOne({ _id: otpDoc._id });

    const user = await User.findOne({ email });

    // Existing User
    if (user) {
        user.lastLogin = new Date();
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await RefreshToken.create({
            user: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000) // 10 years
        });

        return {
            isNewUser: false,
            accessToken,
            refreshToken,
            user
        };
    }

    // New User
    const signupToken = generateSignupToken(email);

    return {
        isNewUser: true,
        signupToken
    };

};

// Complete Profile
const completeProfileService = async ({
    signupToken,
    name,
    mobile,
    role,
    leaderCode,
    leaderRegistrationCode,
    state,
    district
}) => {

    const decoded = verifySignupToken(signupToken);
    const email = decoded.email;

    let joinedLeader = null;
    let myLeaderCode = null;

    if (role === "leader") {
        if (!process.env.LEADER_REGISTRATION_CODE) {
            throw new Error("Leader registration code is not configured on the server.");
        }
        if (leaderRegistrationCode !== process.env.LEADER_REGISTRATION_CODE) {
            throw new Error("You are not able to be a leader");
        }
        myLeaderCode = await createUniqueLeaderCode();
    }

    if (role === "volunteer") {
        const leader = await User.findOne({ leaderCode });

        if (!leader) {
            throw new Error("Invalid leader code.");
        }

        joinedLeader = leader._id;

        await User.findByIdAndUpdate(
            leader._id,
            { $inc: { referralCount: 1 } }
        );
    }

    const user = await User.create({
        name,
        email,
        mobile,
        role,
        leaderCode: myLeaderCode,
        joinedLeader,
        state: state || "",
        district: district || ""
    });

    if (role === "volunteer" && joinedLeader) {
        await generateLinksForVolunteer(user._id, joinedLeader);
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000) // 10 years
    });

    return {
        accessToken,
        refreshToken,
        user
    };

};

// Refresh Token
const refreshTokenService = async (refreshToken) => {

    verifyRefreshToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
        token: refreshToken,
        isRevoked: false
    }).populate("user");

    if (!storedToken) {
        throw new Error("Invalid refresh token.");
    }

    const accessToken = generateAccessToken(
        storedToken.user
    );

    return {
        accessToken
    };

};

// Logout
const logoutService = async (refreshToken) => {

    await RefreshToken.deleteOne({
        token: refreshToken
    });

    return {
        success: true,
        message: "Logged out successfully."
    };

};

// Current User
const meService = async (userId) => {

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found.");
    }

    return user;

};

// Update Push Token
const updatePushTokenService = async (userId, pushToken) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found.");
    }
    user.pushToken = pushToken;
    await user.save();
    return { message: "Push token updated successfully." };
};

module.exports = {
    sendOTPService,
    verifyOTPService,
    completeProfileService,
    refreshTokenService,
    logoutService,
    meService,
    updatePushTokenService
};