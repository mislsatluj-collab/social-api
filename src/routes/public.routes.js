const express = require("express");

const router = express.Router();

const trackingController = require("../modules/tracking/tracking.controller");

// Public Redirect
router.get(
    "/s/:trackingCode",
    trackingController.redirect
);

module.exports = router;