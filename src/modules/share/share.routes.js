const express = require("express");

const router = express.Router();

const shareController = require("./share.controller");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// All Share Routes Require Login
router.use(authMiddleware);

// Volunteer Routes
router.post(
    "/",
    roleMiddleware("volunteer"),
    shareController.markCampaignShared
);

router.get(
    "/my",
    roleMiddleware("volunteer"),
    shareController.getMyShares
);

// Leader Routes
router.get(
    "/leader/history",
    roleMiddleware("leader"),
    shareController.getLeaderShares
);

module.exports = router;