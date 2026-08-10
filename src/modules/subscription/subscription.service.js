const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../../models/Payment");
const SubscriptionPlan = require("../../models/SubscriptionPlan");
const LeaderSubscription = require("../../models/LeaderSubscription");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "YOUR_KEY_ID",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET"
});

// Create Subscription Order
const createOrderService = async (leaderId, planId, months = 1) => {

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan || !plan.isActive) {
        throw new Error("Subscription plan not found or is inactive.");
    }

    const amountPerMonth = plan.price;
    const totalAmount = amountPerMonth * months;
    
    // Amount in paise
    const amountInPaise = totalAmount * 100;

    const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${planId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
        throw new Error("Failed to create Razorpay order.");
    }

    const payment = await Payment.create({
        leader: leaderId,
        plan: planId,
        razorpayOrderId: order.id,
        amount: totalAmount,
        currency: "INR",
        subscriptionMonths: months
    });

    return {
        orderId: order.id,
        amount: totalAmount,
        currency: "INR",
        paymentId: payment._id
    };
};

// Verify Payment
const verifyPaymentService = async (leaderId, data) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = data;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, leader: leaderId });

    if (!payment) {
        throw new Error("Payment record not found.");
    }

    if (payment.status === "paid") {
        throw new Error("Payment is already verified.");
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET")
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        payment.status = "failed";
        await payment.save();
        throw new Error("Invalid payment signature.");
    }

    // Payment is successful
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Update or Create Leader Subscription
    let leaderSubscription = await LeaderSubscription.findOne({ leader: leaderId });
    
    if (!leaderSubscription) {
        leaderSubscription = new LeaderSubscription({
            leader: leaderId,
            plan: payment.plan,
            status: "active",
            expiresAt: new Date()
        });
    } else {
        leaderSubscription.plan = payment.plan;
        leaderSubscription.status = "active";
    }
    
    // Calculate new expiry date
    let currentExpiry = leaderSubscription.expiresAt;
    if (!currentExpiry || currentExpiry < new Date()) {
        currentExpiry = new Date();
    }
    
    // Add months
    currentExpiry.setMonth(currentExpiry.getMonth() + payment.subscriptionMonths);

    leaderSubscription.expiresAt = currentExpiry;
    leaderSubscription.razorpayPaymentId = razorpay_payment_id;
    await leaderSubscription.save();

    return {
        success: true,
        message: "Payment verified successfully.",
        planId: payment.plan,
        expiresAt: leaderSubscription.expiresAt
    };
};

// --- CRUD For Subscription Plans ---

const getAllPlansService = async () => {
    return await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
};

const getPlanByIdService = async (planId) => {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new Error("Subscription plan not found.");
    return plan;
};

const createPlanService = async (data) => {
    const plan = await SubscriptionPlan.create(data);
    return plan;
};

const updatePlanService = async (planId, data) => {
    const plan = await SubscriptionPlan.findByIdAndUpdate(planId, data, { new: true, runValidators: true });
    if (!plan) throw new Error("Subscription plan not found.");
    return plan;
};

const deletePlanService = async (planId) => {
    // Soft delete by setting isActive to false
    const plan = await SubscriptionPlan.findByIdAndUpdate(planId, { isActive: false }, { new: true });
    if (!plan) throw new Error("Subscription plan not found.");
    return { success: true, message: "Subscription plan deleted (deactivated) successfully." };
};

module.exports = {
    createOrderService,
    verifyPaymentService,
    getAllPlansService,
    getPlanByIdService,
    createPlanService,
    updatePlanService,
    deletePlanService
};
