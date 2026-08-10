const express = require("express");

const router = express.Router();

const subscriptionController = require("./subscription.controller");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

// --- Public / General Access ---
// Anyone can view available plans
router.get("/plans", subscriptionController.getAllPlans);
router.get("/plans/:id", subscriptionController.getPlanById);

// --- Admin Only Routes ---
// CRUD operations for subscription plans
router.post("/plans", authMiddleware, roleMiddleware("admin"), subscriptionController.createPlan);
router.put("/plans/:id", authMiddleware, roleMiddleware("admin"), subscriptionController.updatePlan);
router.delete("/plans/:id", authMiddleware, roleMiddleware("admin"), subscriptionController.deletePlan);

// --- Leader Only Routes ---
// Payments and Subscriptions
router.post("/create-order", authMiddleware, roleMiddleware("leader"), subscriptionController.createOrder);
router.post("/verify-payment", authMiddleware, roleMiddleware("leader"), subscriptionController.verifyPayment);

module.exports = router;
