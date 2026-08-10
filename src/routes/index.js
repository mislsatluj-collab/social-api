const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const leaderRoutes = require("../modules/leader/leader.routes");
const campaignRoutes = require("../modules/campaign/campaign.routes");
const shareRoutes = require("../modules/share/share.routes");
const trackingRoutes = require("../modules/tracking/tracking.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");

router.use("/auth", authRoutes);
router.use("/leader", leaderRoutes);
router.use("/campaign", campaignRoutes);
router.use("/share", shareRoutes);
router.use("/tracking", trackingRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;