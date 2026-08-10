const express = require("express");

const router = express.Router();

const authController = require("./auth.controller");

const authMiddleware = require("../../middleware/authMiddleware");

const validate = require("../../middleware/validate");
const authValidation = require("../validations/auth.validation");

router.post(
    "/send-otp",
    validate(authValidation.sendOTP),
    authController.sendOTP
);

router.post(
    "/verify-otp",
    validate(authValidation.verifyOTP),
    authController.verifyOTP
);

router.post(
    "/complete-profile",
    validate(authValidation.completeProfile),
    authController.completeProfile
);

router.post("/check-email", authController.checkEmail);
router.post("/login-password", authController.loginWithPassword);
router.post("/reset-password", authController.resetPassword);

// Public Routes
router.post("/send-otp", authController.sendOTP);

router.post("/verify-otp", authController.verifyOTP);

router.post("/complete-profile", authController.completeProfile);

router.post("/refresh-token", authController.refreshToken);

router.post("/logout", authController.logout);

// Protected Routes
router.get("/me", authMiddleware, authController.me);

router.post("/push-token", authMiddleware, authController.updatePushToken);

module.exports = router;