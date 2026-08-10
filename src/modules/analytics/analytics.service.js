const User = require("../../models/User");
const Campaign = require("../../models/Campaign");
const Share = require("../../models/Share");
const CampaignTrackingLink = require("../../models/CampaignTrackingLink");
const TrackingClick = require("../../models/TrackingClick");
const mongoose = require("mongoose");

const getLeaderDashboardService = async (leaderId) => {
    const totalVolunteers = await User.countDocuments({ joinedLeader: leaderId });
    const totalCampaigns = await Campaign.countDocuments({ leader: leaderId, isActive: true });

    // Aggregate stats from campaigns
    const stats = await Campaign.aggregate([
        { $match: { leader: new mongoose.Types.ObjectId(leaderId), isActive: true } },
        {
            $group: {
                _id: null,
                trackingLinksGenerated: { $sum: "$trackingLinksGenerated" },
                totalShares: { $sum: "$totalShares" },
                totalClicks: { $sum: "$totalClicks" },
                uniqueVisitors: { $sum: "$uniqueVisitors" }
            }
        }
    ]);

    return {
        totalVolunteers,
        totalCampaigns,
        trackingLinksGenerated: stats[0]?.trackingLinksGenerated || 0,
        totalShares: stats[0]?.totalShares || 0,
        totalClicks: stats[0]?.totalClicks || 0,
        uniqueVisitors: stats[0]?.uniqueVisitors || 0
    };
};

const getCampaignAnalyticsService = async (campaignId, leaderId) => {
    const campaign = await Campaign.findOne({ _id: campaignId, leader: leaderId });
    if (!campaign) throw new Error("Campaign not found");

    const ctr = campaign.totalShares > 0 ? (campaign.totalClicks / campaign.totalShares) * 100 : 0;

    // Top Volunteer
    const topVolunteerAgg = await CampaignTrackingLink.find({ campaign: campaignId })
        .sort({ totalClicks: -1 })
        .limit(1)
        .populate("volunteer", "name mobile");
    const topVolunteer = topVolunteerAgg.length > 0 ? topVolunteerAgg[0].volunteer : null;

    // Top Platform
    const topPlatformAgg = await TrackingClick.aggregate([
        { $match: { campaign: new mongoose.Types.ObjectId(campaignId) } },
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);
    const topPlatform = topPlatformAgg.length > 0 ? topPlatformAgg[0]._id : "None";

    return {
        campaignName: campaign.title,
        shares: campaign.totalShares,
        trackingLinks: campaign.trackingLinksGenerated,
        totalClicks: campaign.totalClicks,
        uniqueVisitors: campaign.uniqueVisitors,
        ctr: ctr.toFixed(2) + "%",
        topVolunteer,
        topPlatform
    };
};

const getVolunteerAnalyticsService = async (volunteerId) => {
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || !volunteer.joinedLeader) throw new Error("Volunteer not valid");

    const campaignsShared = (await Share.distinct("campaign", { volunteer: volunteerId })).length;

    const links = await CampaignTrackingLink.find({ volunteer: volunteerId }).populate("campaign", "title");
    
    let totalClicksGenerated = 0;
    let uniqueVisitorsGenerated = 0;
    let mostSuccessfulCampaign = null;
    let maxClicks = -1;

    for (const link of links) {
        totalClicksGenerated += link.totalClicks;
        uniqueVisitorsGenerated += link.uniqueVisitors;
        if (link.totalClicks > maxClicks) {
            maxClicks = link.totalClicks;
            mostSuccessfulCampaign = link.campaign ? link.campaign.title : "None";
        }
    }

    const topPlatformAgg = await TrackingClick.aggregate([
        { $match: { volunteer: new mongoose.Types.ObjectId(volunteerId) } },
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);
    const mostUsedPlatform = topPlatformAgg.length > 0 ? topPlatformAgg[0]._id : "None";

    // Ranking among volunteers under the same leader
    const rankingAgg = await CampaignTrackingLink.aggregate([
        { $match: { leader: new mongoose.Types.ObjectId(volunteer.joinedLeader) } },
        { $group: { _id: "$volunteer", totalClicks: { $sum: "$totalClicks" } } },
        { $sort: { totalClicks: -1 } }
    ]);

    let ranking = 0;
    for (let i = 0; i < rankingAgg.length; i++) {
        if (rankingAgg[i]._id.toString() === volunteerId.toString()) {
            ranking = i + 1;
            break;
        }
    }

    return {
        campaignsShared,
        totalClicksGenerated,
        uniqueVisitorsGenerated,
        mostSuccessfulCampaign,
        mostUsedPlatform,
        rankingAmongVolunteers: ranking > 0 ? ranking : "N/A"
    };
};

const getLeaderboardService = async (leaderId) => {
    const topVolunteersAgg = await CampaignTrackingLink.aggregate([
        { $match: { leader: new mongoose.Types.ObjectId(leaderId) } },
        {
            $group: {
                _id: "$volunteer",
                totalClicks: { $sum: "$totalClicks" },
                uniqueVisitors: { $sum: "$uniqueVisitors" }
            }
        },
        { $sort: { totalClicks: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "volunteerDetails"
            }
        },
        { $unwind: "$volunteerDetails" },
        {
            $project: {
                _id: 1,
                totalClicks: 1,
                uniqueVisitors: 1,
                name: "$volunteerDetails.name",
                mobile: "$volunteerDetails.mobile"
            }
        }
    ]);

    return topVolunteersAgg;
};

module.exports = {
    getLeaderDashboardService,
    getCampaignAnalyticsService,
    getVolunteerAnalyticsService,
    getLeaderboardService
};
