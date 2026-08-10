const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
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

        platform: {
            type: String,
            required: true,
            enum: ["Instagram", "Facebook", "WhatsApp", "Telegram", "Twitter/X", "Copy Link", "Unknown"],
            default: "Unknown"
        },

        sharedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// We want to allow multiple shares, so we do NOT enforce a unique index 
// on (campaign, volunteer) anymore.
shareSchema.index({ campaign: 1, volunteer: 1 });

module.exports = mongoose.model("Share", shareSchema);