const shareService = require("./share.service");

// Mark Campaign as Shared (Log Share Event)
exports.markCampaignShared = async (req, res, next) => {
    try {
        const { campaignId, platform } = req.body;

        if (!campaignId) {
            return res.status(400).json({ success: false, message: "Campaign ID is required." });
        }

        const share = await shareService.markCampaignSharedService(
            campaignId,
            req.user._id,
            platform
        );

        return res.status(201).json({
            success: true,
            message: "Campaign share logged successfully.",
            share
        });

    } catch (error) {
        next(error);
    }
};

// My Shared Campaigns
exports.getMyShares = async (req, res, next) => {
    try {

        const shares = await shareService.getMySharesService(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            shares
        });

    } catch (error) {
        next(error);
    }
};

// Leader Share History
exports.getLeaderShares = async (req, res, next) => {
    try {

        const shares = await shareService.getLeaderSharesService(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            shares
        });

    } catch (error) {
        next(error);
    }
};