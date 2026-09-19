const express = require("express");

const {
    verifyEmail,
    verifyPhone,
    sendPhoneOtp
} = require("../controllers/verification.controller");
const {
    emailOtpVerificationRateLimit,
    phoneOtpSendRateLimit,
    phoneOtpVerificationRateLimit
} = require("../middleware/authRateLimit.middleware");
const {
    validateNoQueryParameters,
    validateEmailOtpVerification,
    validatePhoneOtpSend,
    validatePhoneOtpVerification
} = require("../middleware/requestValidation.middleware");

const router = express.Router();


// ======================================================
// EMAIL VERIFICATION
// ======================================================

router.post(
    "/verify-email",
    emailOtpVerificationRateLimit,
    validateNoQueryParameters,
    validateEmailOtpVerification,
    verifyEmail
);


// ======================================================
// PHONE OTP
// ======================================================

// Send OTP to user's phone
router.post(
    "/send-phone-otp",
    phoneOtpSendRateLimit,
    validateNoQueryParameters,
    validatePhoneOtpSend,
    sendPhoneOtp
);


// Verify OTP entered by user
router.post(
    "/verify-phone",
    phoneOtpVerificationRateLimit,
    validateNoQueryParameters,
    validatePhoneOtpVerification,
    verifyPhone
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
