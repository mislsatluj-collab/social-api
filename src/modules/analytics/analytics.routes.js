const express = require("express");
const router = express.Router();
const analyticsController = require("./analytics.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

router.use(authMiddleware);

// Leader Analytics
router.get(
    "/leader/dashboard",
    roleMiddleware("leader"),
    analyticsController.getLeaderDashboard
);

router.get(
    "/leader/campaign/:campaignId",
    roleMiddleware("leader"),
    analyticsController.getCampaignAnalytics
);

router.get(
    "/leader/leaderboard",
    roleMiddleware("leader"),
    analyticsController.getLeaderLeaderboard
);

// Volunteer Analytics
router.get(
    "/volunteer/dashboard",
    roleMiddleware("volunteer"),
    analyticsController.getVolunteerAnalytics
);

router.get(
    "/volunteer/leaderboard",
    roleMiddleware("volunteer"),
    analyticsController.getVolunteerLeaderboard
);

module.exports = router;
