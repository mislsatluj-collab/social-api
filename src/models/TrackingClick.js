const mongoose = require("mongoose");

const trackingClickSchema = new mongoose.Schema(
    {
        trackingLink: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CampaignTrackingLink",
            required: true,
            index: true
        },

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

        ip: {
            type: String,
            default: ""
        },

        userAgent: {
            type: String,
            default: ""
        },

        referrer: {
            type: String,
            default: ""
        },

        device: {
            type: String,
            default: ""
        },

        browser: {
            type: String,
            default: ""
        },

        os: {
            type: String,
            default: ""
        },

        platform: {
            type: String,
            default: "Unknown"
        },

        visitedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model(
    "TrackingClick",
    trackingClickSchema
);