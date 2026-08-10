const authService = require("./auth.service");

// Send OTP
exports.sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        const response = await authService.sendOTPService(email);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
    try {

        const response = await authService.verifyOTPService(req.body);

        return res.status(200).json({
            success: true,
            ...response
        });

    } catch (error) {
        next(error);
    }
};

// Complete Profile
exports.completeProfile = async (req, res, next) => {
    try {

        const response = await authService.completeProfileService(req.body);

        return res.status(201).json({
            success: true,
            ...response
        });

    } catch (error) {
        next(error);
    }
};

// Refresh Token
exports.refreshToken = async (req, res, next) => {
    try {

        const { refreshToken } = req.body;

        const response = await authService.refreshTokenService(refreshToken);

        return res.status(200).json({
            success: true,
            ...response
        });

    } catch (error) {
        next(error);
    }
};

// Logout
exports.logout = async (req, res, next) => {
    try {

        const { refreshToken } = req.body;

        const response = await authService.logoutService(refreshToken);

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
};

// Current User
exports.me = async (req, res, next) => {
    try {

        const user = await authService.meService(req.user.id);

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        if (error.message === "User not found.") {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found." });
        }
        next(error);
    }
};

// Update Push Token
exports.updatePushToken = async (req, res, next) => {
    try {
        const { pushToken } = req.body;
        const response = await authService.updatePushTokenService(req.user.id, pushToken);
        return res.status(200).json({ success: true, ...response });
    } catch (error) {
        next(error);
    }
};