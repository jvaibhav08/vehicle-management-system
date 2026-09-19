const verificationService = require("../services/verification.service");

const phoneOtpService = require("../services/phoneOtp.service");


// ======================================================
// VERIFY EMAIL OTP
// ======================================================

const verifyEmail = async (req, res) => {

    try {

        const { email, otp, purpose = "email_verification" } = req.body;

        // Check required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        if (
            purpose !== "email_verification" &&
            purpose !== "login"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP purpose"
            });
        }

        const result = await verificationService.verifyEmailOtp(
            email,
            otp,
            purpose
        );

        return res.status(
            result.success ? 200 : 400
        ).json(result);

    } catch (error) {

        console.log(
            "Email verification controller error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ======================================================
// VERIFY PHONE OTP
// ======================================================

const verifyPhone = async (req, res) => {

    try {

        const { phone, otp } = req.body;

        // Check required fields
        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone and OTP are required"
            });
        }

        const result = await verificationService.verifyPhoneOtp(
            phone,
            otp
        );

        return res.json(result);

    } catch (error) {

        console.log(
            "Phone verification controller error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ======================================================
// SEND PHONE OTP
// ======================================================

const sendPhoneOtp = async (req, res) => {

    try {

        const { userId, phone } = req.body;

        // Check required fields
        if (!userId || !phone) {
            return res.status(400).json({
                success: false,
                message: "User ID and phone are required"
            });
        }

        const result = await phoneOtpService.sendPhoneOtp(
            userId,
            phone
        );

        return res.json(result);

    } catch (error) {

        console.log(
            "Send phone OTP controller error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
    verifyEmail,
    verifyPhone,
    sendPhoneOtp
};
