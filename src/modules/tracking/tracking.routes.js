const express = require("express");

const router = express.Router();

const trackingController = require("./tracking.controller");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// Generate Personal Tracking Link
router.get(
    "/:campaignId",
    authMiddleware,
    roleMiddleware("volunteer"),
    trackingController.generateTrackingLink
);

module.exports = router;