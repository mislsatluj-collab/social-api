const express = require("express");

const router = express.Router();

const campaignController = require("./campaign.controller");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const createUploader = require("../../middleware/uploadMiddleware");
const validate = require("../../middleware/validate");
const campaignValidation = require("../validations/campaign.validation");

const upload = createUploader("campaigns");

// All campaign routes require authentication
router.use(authMiddleware);

router.post(
    "/",
    roleMiddleware("leader"),
    validate(campaignValidation.createCampaign),
    campaignController.createCampaign
);

router.post(
    "/upload",
    roleMiddleware("leader"),
    upload.single("image"),
    campaignController.uploadCampaignImage
);

// Leader Routes
router.post(
    "/",
    roleMiddleware("leader"),
    campaignController.createCampaign
);

router.get(
    "/",
    roleMiddleware("leader"),
    campaignController.getLeaderCampaigns
);

// Volunteer Route
router.get(
    "/feed",
    roleMiddleware("volunteer"),
    campaignController.getVolunteerFeed
);

router.get(
    "/:id",
    roleMiddleware("leader"),
    campaignController.getCampaignById
);

router.put(
    "/:id",
    roleMiddleware("leader"),
    campaignController.updateCampaign
);

router.delete(
    "/:id",
    roleMiddleware("leader"),
    campaignController.deleteCampaign
);



module.exports = router;