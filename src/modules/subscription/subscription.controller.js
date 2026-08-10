const subscriptionService = require("./subscription.service");

// Create Order
exports.createOrder = async (req, res, next) => {
    try {
        const { planId, months } = req.body;
        
        if (!planId) {
            return res.status(400).json({ success: false, message: "Plan ID is required." });
        }

        const response = await subscriptionService.createOrderService(req.user._id, planId, months);

        return res.status(200).json({
            success: true,
            ...response
        });
    } catch (error) {
        next(error);
    }
};

// Verify Payment
exports.verifyPayment = async (req, res, next) => {
    try {
        const response = await subscriptionService.verifyPaymentService(req.user._id, req.body);

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};
// --- CRUD For Subscription Plans ---

exports.getAllPlans = async (req, res, next) => {
    try {
        const plans = await subscriptionService.getAllPlansService();
        return res.status(200).json({ success: true, plans });
    } catch (error) {
        next(error);
    }
};

exports.getPlanById = async (req, res, next) => {
    try {
        const plan = await subscriptionService.getPlanByIdService(req.params.id);
        return res.status(200).json({ success: true, plan });
    } catch (error) {
        next(error);
    }
};

exports.createPlan = async (req, res, next) => {
    try {
        const plan = await subscriptionService.createPlanService(req.body);
        return res.status(201).json({ success: true, plan });
    } catch (error) {
        next(error);
    }
};

exports.updatePlan = async (req, res, next) => {
    try {
        const plan = await subscriptionService.updatePlanService(req.params.id, req.body);
        return res.status(200).json({ success: true, plan });
    } catch (error) {
        next(error);
    }
};

exports.deletePlan = async (req, res, next) => {
    try {
        const response = await subscriptionService.deletePlanService(req.params.id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};
