const leaderService = require("./leader.service");

// Upload Profile Image
exports.uploadProfileImage = async (req, res, next) => {

    try {

        const leader =
            await leaderService.uploadProfileImageService(
                req.user._id,
                req.file
            );

        return res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully.",
            leader
        });

    } catch (error) {

        next(error);

    }

};

// Get Leader Profile
exports.getProfile = async (req, res, next) => {
    try {

        const leader = await leaderService.getProfileService(req.user._id);

        return res.status(200).json({
            success: true,
            leader
        });

    } catch (error) {
        next(error);
    }
};

// Update Leader Profile
exports.updateProfile = async (req, res, next) => {
    try {

        const leader = await leaderService.updateProfileService(
            req.user._id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            leader
        });

    } catch (error) {
        next(error);
    }
};

// Dashboard
exports.getDashboard = async (req, res, next) => {
    try {

        const dashboard = await leaderService.getDashboardService(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            dashboard
        });

    } catch (error) {
        next(error);
    }
};

// Volunteers
exports.getVolunteers = async (req, res, next) => {
    try {

        const { state, district } = req.query;

        const volunteers = await leaderService.getVolunteersService(
            req.user._id,
            state,
            district
        );

        return res.status(200).json({
            success: true,
            volunteers
        });

    } catch (error) {
        next(error);
    }
};

// Analytics
exports.getAnalytics = async (req, res, next) => {
    try {

        const analytics = await leaderService.getAnalyticsService(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            analytics
        });

    } catch (error) {
        next(error);
    }
};