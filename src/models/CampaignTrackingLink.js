const mongoose = require("mongoose");

const campaignTrackingLinkSchema = new mongoose.Schema(
    {
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true,
            index: true
        },

        volunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        trackingCode: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        totalClicks: {
            type: Number,
            default: 0
        },

        uniqueVisitors: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

campaignTrackingLinkSchema.index(
    {
        campaign: 1,
        volunteer: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "CampaignTrackingLink",
    campaignTrackingLinkSchema
);