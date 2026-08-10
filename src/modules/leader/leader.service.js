const User = require("../../models/User");
const Campaign = require("../../models/Campaign");
const Share = require("../../models/Share");
const deleteFile = require("../../utils/deleteFile");
const { getFileUrl } = require("../../services/fileService");
const TrackingClick = require("../../models/TrackingClick");
const mongoose = require("mongoose");

// Get Leader Profile
const getProfileService = async (userId) => {

    const leader = await User.findById(userId).select("-__v");

    if (!leader) {
        throw new Error("Leader not found.");
    }

    return leader;

};

// Update Leader Profile
const updateProfileService = async (userId, data) => {

    const { name, profileImage } = data;

    const leader = await User.findById(userId);

    if (!leader) {
        throw new Error("Leader not found.");
    }

    if (name) {
        leader.name = name;
    }

    if (profileImage !== undefined) {
        leader.profileImage = profileImage;
    }

    await leader.save();

    return leader;

};

// Dashboard
const getDashboardService = async (userId) => {

    const totalVolunteers = await User.countDocuments({
        joinedLeader: userId
    });

    const totalCampaigns = await Campaign.countDocuments({
        leader: userId
    });

    const activeCampaigns = await Campaign.countDocuments({
        leader: userId,
        isActive: true
    });

    const totalShares = await Share.countDocuments({
        leader: userId
    });

    // Aggregate clicks for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const clicksData = await TrackingClick.aggregate([
        {
            $match: {
                leader: new mongoose.Types.ObjectId(userId),
                visitedAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Format clicksData to ensure all 7 days exist even if 0
    const clickTrends = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const match = clicksData.find(c => c._id === dateStr);
        
        // Use short date format like "Mon" or "12/05" for frontend charts
        const shortDate = d.toLocaleDateString('en-US', { weekday: 'short' });

        clickTrends.push({
            date: dateStr,
            label: shortDate,
            clicks: match ? match.count : 0
        });
    }

    return {
        totalVolunteers,
        totalCampaigns,
        activeCampaigns,
        totalShares,
        clickTrends
    };

};

// Volunteers List
const getVolunteersService = async (userId, state, district) => {
    
    const matchStage = { joinedLeader: new mongoose.Types.ObjectId(userId) };
    if (state) matchStage.state = state;
    if (district) matchStage.district = district;

    const volunteers = await User.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "campaigntrackinglinks",
                localField: "_id",
                foreignField: "volunteer",
                as: "links"
            }
        },
        {
            $lookup: {
                from: "shares",
                localField: "_id",
                foreignField: "volunteer",
                as: "shares"
            }
        },
        {
            $addFields: {
                totalClicks: { $sum: "$links.totalClicks" },
                totalShares: { $size: "$shares" }
            }
        },
        {
            $project: {
                name: 1,
                mobile: 1,
                isActive: 1,
                createdAt: 1,
                lastActiveAt: 1,
                totalClicks: 1,
                totalShares: 1
            }
        },
        { $sort: { totalClicks: 1, createdAt: -1 } } // Sort by least clicks first
    ]);

    return volunteers;

};

// Analytics
const getAnalyticsService = async (userId) => {

    const campaigns = await Campaign.countDocuments({
        leader: userId
    });

    const volunteers = await User.countDocuments({
        joinedLeader: userId
    });

    const shares = await Share.countDocuments({
        leader: userId
    });

    return {
        campaigns,
        volunteers,
        shares
    };

};


// Upload Profile Image
const uploadProfileImageService = async (userId, file) => {

    if (!file) {
        throw new Error("Profile image is required.");
    }

    const leader = await User.findById(userId);

    if (!leader) {
        throw new Error("Leader not found.");
    }

    if (leader.profileImage) {
        deleteFile(leader.profileImage);
    }

    leader.profileImage = getFileUrl(
        "profiles",
        file.filename
    );

    await leader.save();

    return leader;

};

module.exports = {
    getProfileService,
    updateProfileService,
    getDashboardService,
    getVolunteersService,
    getAnalyticsService,
    uploadProfileImageService
};