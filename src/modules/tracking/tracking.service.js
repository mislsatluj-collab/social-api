const crypto = require("crypto");

const Campaign = require("../../models/Campaign");
const CampaignTrackingLink = require("../../models/CampaignTrackingLink");
const TrackingClick = require("../../models/TrackingClick");
const { getIO } = require("../../config/socket");

// Generate Tracking Link
const generateTrackingLinkService = async (
    campaignId,
    volunteerId
) => {

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
        throw new Error("Campaign not found.");
    }

    let trackingLink = await CampaignTrackingLink.findOne({
        campaign: campaignId,
        volunteer: volunteerId
    });

    if (trackingLink) {
        return trackingLink;
    }

    const trackingCode = crypto
        .randomBytes(5)
        .toString("hex")
        .toUpperCase();

    trackingLink = await CampaignTrackingLink.create({
        campaign: campaign._id,
        volunteer: volunteerId,
        leader: campaign.leader,
        trackingCode
    });

    campaign.trackingLinksGenerated += 1;

    await campaign.save();

    return trackingLink;

};

// Redirect Visitor
const redirectService = async (
    trackingCode,
    req
) => {

    const trackingLink = await CampaignTrackingLink
        .findOne({
            trackingCode
        })
        .populate("campaign");

    if (!trackingLink) {
        throw new Error("Tracking link not found.");
    }

    const campaign = trackingLink.campaign;

    const ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "";

    const userAgent =
        req.headers["user-agent"] || "";

    const referrer =
        req.headers["referer"] || "";

    // Parse User Agent
    const UAParser = require("ua-parser-js");
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";
    const device = result.device.type || (result.os.name === 'Android' || result.os.name === 'iOS' ? 'mobile' : 'desktop');

    let platform = "Direct";

    if (referrer.includes("facebook") || referrer.includes("fb.com") || referrer.includes("fb.me"))
        platform = "Facebook";
    else if (referrer.includes("instagram"))
        platform = "Instagram";
    else if (referrer.includes("whatsapp") || referrer.includes("wa.me"))
        platform = "WhatsApp";
    else if (referrer.includes("telegram") || referrer.includes("t.me"))
        platform = "Telegram";
    else if (referrer.includes("twitter") || referrer.includes("t.co"))
        platform = "Twitter/X";
    else if (referrer.includes("linkedin"))
        platform = "LinkedIn";

    const existingVisitor = await TrackingClick.findOne({
        campaign: campaign._id, // Deduplicate across the entire campaign
        ip,
        userAgent
    });

    if (existingVisitor) {
        return campaign.shareLink; // Do not log duplicate click from same device
    }

    const isUnique = true; // Since we are blocking duplicate device clicks entirely

    await TrackingClick.create({
        trackingLink: trackingLink._id,
        campaign: campaign._id,
        volunteer: trackingLink.volunteer,
        leader: trackingLink.leader,
        ip,
        userAgent,
        referrer,
        platform,
        browser,
        os,
        device
    });

    trackingLink.totalClicks += 1;
    campaign.totalClicks += 1;

    if (isUnique) {
        trackingLink.uniqueVisitors += 1;
        campaign.uniqueVisitors += 1;
    }

    await trackingLink.save();
    await campaign.save();

    // Emit real-time event to leader
    try {
        const io = getIO();
        io.to(trackingLink.leader.toString()).emit("new_click", {
            campaignName: campaign.title,
            volunteerId: trackingLink.volunteer
        });
    } catch (err) {
        console.error("Socket emit error:", err.message);
    }

    return campaign.shareLink;

};

// Batch Generate for Campaign (When campaign is created)
const generateLinksForCampaign = async (campaignId, leaderId, volunteerIds) => {
    if (!volunteerIds || volunteerIds.length === 0) return;

    const linksToCreate = volunteerIds.map(volunteerId => {
        const trackingCode = crypto.randomBytes(5).toString("hex").toUpperCase();
        return {
            campaign: campaignId,
            volunteer: volunteerId,
            leader: leaderId,
            trackingCode
        };
    });

    await CampaignTrackingLink.insertMany(linksToCreate);

    await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { trackingLinksGenerated: linksToCreate.length }
    });
};

// Batch Generate for Volunteer (When volunteer joins leader)
const generateLinksForVolunteer = async (volunteerId, leaderId) => {
    const activeCampaigns = await Campaign.find({ leader: leaderId, isActive: true });
    
    if (activeCampaigns.length === 0) return;

    const linksToCreate = activeCampaigns.map(campaign => {
        const trackingCode = crypto.randomBytes(5).toString("hex").toUpperCase();
        return {
            campaign: campaign._id,
            volunteer: volunteerId,
            leader: leaderId,
            trackingCode
        };
    });

    await CampaignTrackingLink.insertMany(linksToCreate);

    const campaignIds = activeCampaigns.map(c => c._id);
    await Campaign.updateMany(
        { _id: { $in: campaignIds } },
        { $inc: { trackingLinksGenerated: 1 } }
    );
};

module.exports = {

    generateTrackingLinkService,

    redirectService,
    
    generateLinksForCampaign,
    
    generateLinksForVolunteer

};