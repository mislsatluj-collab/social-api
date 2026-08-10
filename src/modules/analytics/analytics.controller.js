const analyticsService = require("./analytics.service");

exports.getLeaderDashboard = async (req, res, next) => {
    try {
        const dashboard = await analyticsService.getLeaderDashboardService(req.user._id);
        return res.status(200).json({ success: true, dashboard });
    } catch (error) {
        next(error);
    }
};

exports.getCampaignAnalytics = async (req, res, next) => {
    try {
        const analytics = await analyticsService.getCampaignAnalyticsService(req.params.campaignId, req.user._id);
        return res.status(200).json({ success: true, analytics });
    } catch (error) {
        next(error);
    }
};

exports.getVolunteerAnalytics = async (req, res, next) => {
    try {
        const analytics = await analyticsService.getVolunteerAnalyticsService(req.user._id);
        return res.status(200).json({ success: true, analytics });
    } catch (error) {
        next(error);
    }
};

exports.getLeaderLeaderboard = async (req, res, next) => {
    try {
        const leaderboard = await analyticsService.getLeaderboardService(req.user._id);
        return res.status(200).json({ success: true, leaderboard });
    } catch (error) {
        next(error);
    }
};

exports.getVolunteerLeaderboard = async (req, res, next) => {
    try {
        if (!req.user.joinedLeader) {
            return res.status(400).json({ success: false, message: "Volunteer is not assigned to a leader." });
        }
        const leaderboard = await analyticsService.getLeaderboardService(req.user.joinedLeader);
        return res.status(200).json({ success: true, leaderboard });
    } catch (error) {
        next(error);
    }
};
