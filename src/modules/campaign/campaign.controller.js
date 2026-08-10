const campaignService = require("./campaign.service");

// Create Campaign
exports.createCampaign = async (req, res, next) => {
    try {

        const campaign = await campaignService.createCampaignService(
            req.user._id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Campaign created successfully.",
            campaign
        });

    } catch (error) {
        next(error);
    }
};

// Leader Campaign List
exports.getLeaderCampaigns = async (req, res, next) => {
    try {

        const campaigns = await campaignService.getLeaderCampaignsService(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            campaigns
        });

    } catch (error) {
        next(error);
    }
};

// Campaign Details
exports.getCampaignById = async (req, res, next) => {
    try {

        const campaign = await campaignService.getCampaignByIdService(
            req.params.id,
            req.user._id
        );

        return res.status(200).json({
            success: true,
            campaign
        });

    } catch (error) {
        next(error);
    }
};

// Update Campaign
exports.updateCampaign = async (req, res, next) => {
    try {

        const campaign = await campaignService.updateCampaignService(
            req.params.id,
            req.user._id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Campaign updated successfully.",
            campaign
        });

    } catch (error) {
        next(error);
    }
};

// Delete Campaign
exports.deleteCampaign = async (req, res, next) => {
    try {

        const response = await campaignService.deleteCampaignService(
            req.params.id,
            req.user._id
        );

        return res.status(200).json(response);

    } catch (error) {
        next(error);
    }
};

// Volunteer Feed
exports.getVolunteerFeed = async (req, res, next) => {
    try {

        const campaigns = await campaignService.getVolunteerFeedService(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            campaigns
        });

    } catch (error) {
        next(error);
    }
};

// Upload Campaign Image
exports.uploadCampaignImage = async (req, res, next) => {

    try {

        const result =
            await campaignService.uploadCampaignImageService(
                req.file
            );

        return res.status(200).json({
            success: true,
            message: "Campaign image uploaded successfully.",
            ...result
        });

    } catch (error) {

        next(error);

    }

};