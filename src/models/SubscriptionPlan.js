const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        price: {
            type: Number,
            required: true
        },
        
        campaignLimit: {
            type: Number,
            required: true
        },

        durationInMonths: {
            type: Number,
            default: 1
        },

        features: [
            {
                type: String
            }
        ],

        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
