const mongoose = require("mongoose");
const SubscriptionPlan = require("./src/models/SubscriptionPlan");
const env = require("./src/config/env");

mongoose.connect(env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB...");

    const plans = [
        {
            name: "Starter",
            price: 500,
            campaignLimit: 2,
            durationInMonths: 1,
            features: ["Create up to 2 campaigns", "Real-time analytics", "Standard support"]
        },
        {
            name: "Pro",
            price: 1500,
            campaignLimit: 10,
            durationInMonths: 1,
            features: ["Create up to 10 campaigns", "Advanced analytics", "Priority support"]
        },
        {
            name: "Enterprise",
            price: 5000,
            campaignLimit: 9999,
            durationInMonths: 1,
            features: ["Unlimited campaigns", "Dedicated account manager", "Custom integrations"]
        },
        {
            name: "Testing",
            price: 1,
            campaignLimit: 9999,
            durationInMonths: 1,
            features: ["Testing plan", "Unlimited campaigns"]
        }
    ];

    try {
        await SubscriptionPlan.deleteMany({});
        await SubscriptionPlan.insertMany(plans);
        console.log("Subscription plans seeded successfully!");
    } catch (error) {
        console.error("Error seeding plans:", error);
    } finally {
        mongoose.disconnect();
    }
}).catch(err => {
    console.error("MongoDB connection error:", err);
});
