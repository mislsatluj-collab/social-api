const mongoose = require("mongoose");

const leaderSubscriptionSchema = new mongoose.Schema(
    {
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One active/latest subscription record per leader
            index: true
        },

        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true
        },

        status: {
            type: String,
            enum: ["active", "expired", "cancelled"],
            default: "active",
            index: true
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true
        },

        razorpayPaymentId: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("LeaderSubscription", leaderSubscriptionSchema);
