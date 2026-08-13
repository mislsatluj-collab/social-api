const Campaign = require("../../models/Campaign");
const User = require("../../models/User");
const CampaignTrackingLink = require("../../models/CampaignTrackingLink");

const deleteFile = require("../../utils/deleteFile");
const { getFileUrl } = require("../../services/fileService");
const { sendPushNotification } = require("../../services/pushNotification.service");
const { generateLinksForCampaign } = require("../tracking/tracking.service");
const { getIO } = require("../../config/socket");


// Create Campaign
const createCampaignService = async (userId, data) => {

    const {
        title,
        description,
        mediaType,
        mediaUrl,
        shareLink
    } = data;


    const campaign = await Campaign.create({
        leader: userId,
        title,
        description,
        mediaType,
        mediaUrl,
        shareLink
    });

    const volunteers = await User.find({ joinedLeader: userId }).select("_id pushToken");
    const volunteerIds = volunteers.map(v => v._id);
    await generateLinksForCampaign(campaign._id, userId, volunteerIds);

    try {
        const io = getIO();
        
        const pushTokens = [];

        volunteers.forEach(vol => {
            // Socket emit
            io.to(vol._id.toString()).emit("new_campaign", {
                campaignId: campaign._id,
                title: campaign.title
            });

            // Collect push tokens
            if (vol.pushToken) {
                pushTokens.push(vol.pushToken);
            }
        });

        // Send Push Notifications
        if (pushTokens.length > 0) {
            await sendPushNotification(
                pushTokens,
                "New Campaign Launched! 🚀",
                `Your leader just launched "${campaign.title}". Open the app to start sharing!`,
                { campaignId: campaign._id }
            );
        }

    } catch (err) {
        console.error("Socket or Push emit error:", err.message);
    }

    return campaign;

};

// Leader Campaign List
const getLeaderCampaignsService = async (userId) => {

    const campaigns = await Campaign.find({
        leader: userId
    }).sort({
        createdAt: -1
    });

    return campaigns;

};

// Campaign Details
const getCampaignByIdService = async (campaignId, userId) => {

    const campaign = await Campaign.findOne({
        _id: campaignId,
        leader: userId
    });

    if (!campaign) {
        throw new Error("Campaign not found.");
    }

    return campaign;

};

// Update Campaign
const updateCampaignService = async (
    campaignId,
    userId,
    data
) => {

    const campaign = await Campaign.findOne({
        _id: campaignId,
        leader: userId
    });

    if (!campaign) {
        throw new Error("Campaign not found.");
    }

    Object.assign(campaign, data);

    await campaign.save();

    return campaign;

};

// Delete Campaign
const deleteCampaignService = async (
    campaignId,
    userId
) => {

    const campaign = await Campaign.findOne({
        _id: campaignId,
        leader: userId
    });

    if (!campaign) {
        throw new Error("Campaign not found.");
    }

    await campaign.deleteOne();

    return {
        success: true,
        message: "Campaign deleted successfully."
    };

};

// Volunteer Feed
const getVolunteerFeedService = async (userId) => {

    const volunteer = await User.findById(userId);

    if (!volunteer) {
        throw new Error("Volunteer not found.");
    }

    if (!volunteer.joinedLeader) {
        return [];
    }

    // Mark as active
    volunteer.lastActiveAt = new Date();
    await volunteer.save();


    const campaigns = await Campaign.find({
        leader: volunteer.joinedLeader,
        isActive: true
    })
        .populate("leader", "name profileImage leaderCode")
        .sort({
            createdAt: -1
        })
        .lean();

    const trackingLinks = await CampaignTrackingLink.find({
        volunteer: userId,
        campaign: { $in: campaigns.map(c => c._id) }
    });

    const trackingLinkMap = {};
    trackingLinks.forEach(link => {
        trackingLinkMap[link.campaign.toString()] = link.trackingCode;
    });

    const baseUrl = process.env.BASE_URL || "https://social.mislsatluj.in";

    const feed = campaigns.map(campaign => {
        return {
            ...campaign,
            trackingCode: trackingLinkMap[campaign._id.toString()] || null,
            trackingLink: trackingLinkMap[campaign._id.toString()]
                ? `${baseUrl}/s/${trackingLinkMap[campaign._id.toString()]}`
                : null
        };
    });

    return feed;

};

// Upload Campaign Image
const uploadCampaignImageService = async (file) => {

    if (!file) {
        throw new Error("Campaign image is required.");
    }

    return {
        mediaType: "image",
        mediaUrl: getFileUrl(
            "campaigns",
            file.filename
        )
    };

};

module.exports = {
    createCampaignService,
    getLeaderCampaignsService,
    getCampaignByIdService,
    updateCampaignService,
    deleteCampaignService,
    getVolunteerFeedService,
    uploadCampaignImageService
};