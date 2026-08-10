const express = require("express");

const router = express.Router();

const leaderController = require("./leader.controller");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const createUploader = require("../../middleware/uploadMiddleware");

const upload = createUploader("profiles");

// Apply middleware to all leader routes
router.use(authMiddleware);
router.use(roleMiddleware("leader"));

// Profile
router.get("/profile", leaderController.getProfile);

router.post(
    "/profile/upload",
    upload.single("image"),
    leaderController.uploadProfileImage
);

router.put("/profile", leaderController.updateProfile);

// Dashboard
router.get("/dashboard", leaderController.getDashboard);

// Volunteers
router.get("/volunteers", leaderController.getVolunteers);

// Analytics
router.get("/analytics", leaderController.getAnalytics);

module.exports = router;