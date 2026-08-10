const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true,
            index: true
        },

        razorpayOrderId: {
            type: String,
            required: true,
            unique: true
        },

        razorpayPaymentId: {
            type: String,
            default: null
        },

        razorpaySignature: {
            type: String,
            default: null
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        status: {
            type: String,
            enum: ["created", "paid", "failed"],
            default: "created",
            index: true
        },
        
        subscriptionMonths: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
