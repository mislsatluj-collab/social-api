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

// Check Email Existence & Lock Status
const checkEmailService = async (email) => {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        // New user -> send OTP automatically for signup
        await sendOTP(email);
        return {
            exists: false,
            message: "User not found. OTP sent for registration."
        };
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
        const remainingMs = user.lockUntil.getTime() - Date.now();
        const remainingMins = Math.ceil(remainingMs / (60 * 1000));
        return {
            exists: true,
            isLocked: true,
            remainingMinutes: remainingMins,
            message: `Account is locked. Please try again in ${remainingMins} minute(s) or reset your password.`
        };
    }

    return {
        exists: true,
        isLocked: false,
        message: "User exists. Please enter your password."
    };
};

// Login with Password
const loginWithPasswordService = async ({ email, password }) => {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        throw new Error("User not found.");
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
        const remainingMs = user.lockUntil.getTime() - Date.now();
        const remainingMins = Math.ceil(remainingMs / (60 * 1000));
        throw new Error(`Account locked due to 3 wrong password attempts. Please wait ${remainingMins} minute(s) or reset password.`);
    }

    // If password is not set on older user, force reset/set password
    if (!user.password) {
        throw new Error("Password is not set for this account. Please use 'Reset Password' to set your password.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

        if (user.failedLoginAttempts >= 3) {
            user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lockout
            await user.save();
            throw new Error("Incorrect password 3 times. Your account is locked for 1 hour.");
        }

        await user.save();
        const remainingAttempts = 3 - user.failedLoginAttempts;
        throw new Error(`Invalid password. ${remainingAttempts} attempt(s) remaining before 1-hour account lockout.`);
    }

    // Reset lockout counters on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000)
    });

    return {
        accessToken,
        refreshToken,
        user
    };
};

// Reset Password with OTP
const resetPasswordService = async ({ email, otp, newPassword }) => {
    const otpDoc = await OTP.findOne({ email: email.toLowerCase().trim() });

    if (!otpDoc) {
        throw new Error("OTP not found or expired.");
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

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
        throw new Error("User not found.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return {
        success: true,
        message: "Password reset successfully. Please log in with your new password."
    };
};

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
    password,
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

    const hashedPassword = password ? await bcrypt.hash(password, 10) : "";

    const user = await User.create({
        name,
        email,
        mobile,
        role,
        password: hashedPassword,
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
    checkEmailService,
    loginWithPasswordService,
    resetPasswordService,
    sendOTPService,
    verifyOTPService,
    completeProfileService,
    refreshTokenService,
    logoutService,
    meService,
    updatePushTokenService
};