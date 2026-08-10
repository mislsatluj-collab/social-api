const Share = require("../../models/Share");
const Campaign = require("../../models/Campaign");

// Log Campaign Share Event
const markCampaignSharedService = async (
    campaignId,
    volunteerId,
    platform = "Unknown"
) => {

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
        throw new Error("Campaign not found.");
    }

    const share = await Share.create({
        campaign: campaign._id,
        volunteer: volunteerId,
        leader: campaign.leader,
        platform
    });

    campaign.totalShares += 1;

    await campaign.save();

    return share;

};

// My Shared Campaigns
const getMySharesService = async (volunteerId) => {

    const shares = await Share.find({
        volunteer: volunteerId
    })
        .populate("campaign")
        .sort({
            createdAt: -1
        });

    return shares;

};

// Leader Share History
const getLeaderSharesService = async (leaderId) => {

    const shares = await Share.find({
        leader: leaderId
    })
        .populate("campaign", "title")
        .populate("volunteer", "name mobile profileImage")
        .sort({
            createdAt: -1
        });

    return shares;

};

module.exports = {
    markCampaignSharedService,
    getMySharesService,
    getLeaderSharesService
};