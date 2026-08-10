const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
    {
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },

        mediaType: {
            type: String,
            enum: ["image", "video", "none"],
            default: "none"
        },

        mediaUrl: {
            type: String,
            default: ""
        },

        shareLink: {
            type: String,
            required: true
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        },

       totalShares: {
    type: Number,
    default: 0
},

totalClicks: {
    type: Number,
    default: 0
},

uniqueVisitors: {
    type: Number,
    default: 0
},

trackingLinksGenerated: {
    type: Number,
    default: 0
}
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("Campaign", campaignSchema);