const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authModel = require("../models/auth.model");
const otpModel = require("../models/otp.model");
const phoneOtpModel = require("../models/phoneOtp.model");


// ======================================================
// VERIFY EMAIL OTP
// ======================================================

const verifyEmailOtp = async (
    email,
    otp,
    purpose = "email_verification"
) => {

    try {

        // --------------------------------------------------
        // Find user by email
        // --------------------------------------------------

        const existingUser = await authModel.findByEmail(email);

        if (existingUser.length === 0) {
            return {
                success: false,
                message: "User not found"
            };
        }

        const user = existingUser[0];


        // --------------------------------------------------
        // Only registration verification is blocked once the
        // email has already been verified. Login OTPs require
        // an already verified email.
        // --------------------------------------------------

        if (
            purpose === "email_verification" &&
            user.email_verified === 1
        ) {
            return {
                success: false,
                message: "Email is already verified"
            };
        }

        if (
            purpose === "login" &&
            !user.email_verified
        ) {
            return {
                success: false,
                message: "Please verify your email before logging in"
            };
        }


        // --------------------------------------------------
        // Find latest valid email OTP
        // --------------------------------------------------

        const otpRecords = await otpModel.findValidOtp(
            user.id,
            purpose
        );

        if (otpRecords.length === 0) {
            return {
                success: false,
                message: "OTP expired or not found"
            };
        }

        const otpRecord = otpRecords[0];


        // --------------------------------------------------
        // Check maximum attempts
        // --------------------------------------------------

        if (otpRecord.attempts >= 5) {
            return {
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP."
            };
        }


        // --------------------------------------------------
        // Compare entered OTP with stored hash
        // --------------------------------------------------

        const isOtpValid = await bcrypt.compare(
            otp,
            otpRecord.otp_hash
        );

        if (!isOtpValid) {

            await otpModel.incrementAttempts(
                otpRecord.id
            );

            return {
                success: false,
                message: "Invalid OTP"
            };
        }


        // --------------------------------------------------
        // Mark a newly registered email as verified.
        // --------------------------------------------------

        if (purpose === "email_verification") {

            const result = await authModel.markEmailVerified(
                user.id
            );

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: "Failed to verify email"
                };
            }
        }


        // --------------------------------------------------
        // Delete OTP so it cannot be reused
        // --------------------------------------------------

        await otpModel.deleteOtp(
            otpRecord.id
        );


        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        const trustedDeviceToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                type: "trusted_device"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return {
            success: true,
            message: purpose === "login"
                ? "Login verified successfully"
                : "Email verified successfully",
            token,
            trustedDeviceToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        };

    } catch (error) {

        console.log(
            "Email verification error:",
            error
        );

        return {
            success: false,
            message: "Email verification failed"
        };
    }
};


// ======================================================
// VERIFY PHONE OTP
// ======================================================

const verifyPhoneOtp = async (phone, otp) => {

    try {

        // --------------------------------------------------
        // Find user by phone
        // --------------------------------------------------

        const existingUser = await authModel.findByPhone(phone);

        if (existingUser.length === 0) {
            return {
                success: false,
                message: "User not found"
            };
        }

        const user = existingUser[0];


        // --------------------------------------------------
        // Check if phone is already verified
        // --------------------------------------------------

        if (user.phone_verified === 1) {
            return {
                success: false,
                message: "Phone is already verified"
            };
        }


        // --------------------------------------------------
        // Find latest valid phone OTP
        //
        // phoneOtpModel checks:
        // expires_at > NOW()
        //
        // Therefore an OTP older than 5 minutes
        // automatically becomes invalid.
        // --------------------------------------------------

        const otpRecords =
            await phoneOtpModel.findValidPhoneOtp(
                user.id,
                phone
            );

        if (otpRecords.length === 0) {
            return {
                success: false,
                message: "OTP expired or not found"
            };
        }

        const otpRecord = otpRecords[0];


        // --------------------------------------------------
        // Check maximum attempts
        // --------------------------------------------------

        if (otpRecord.attempts >= 5) {
            return {
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP."
            };
        }


        // --------------------------------------------------
        // Compare entered OTP with stored hash
        // --------------------------------------------------

        const isOtpValid = await bcrypt.compare(
            otp,
            otpRecord.otp_hash
        );

        if (!isOtpValid) {

            await phoneOtpModel.incrementPhoneOtpAttempts(
                otpRecord.id
            );

            return {
                success: false,
                message: "Invalid OTP"
            };
        }


        // --------------------------------------------------
        // Mark phone as verified
        // --------------------------------------------------

        const result = await authModel.markPhoneVerified(
            user.id
        );

        if (result.affectedRows === 0) {
            return {
                success: false,
                message: "Failed to verify phone"
            };
        }


        // --------------------------------------------------
        // Delete OTP so it cannot be reused
        // --------------------------------------------------

        await phoneOtpModel.deletePhoneOtp(
            otpRecord.id
        );


        return {
            success: true,
            message: "Phone verified successfully"
        };

    } catch (error) {

        console.log(
            "Phone verification error:",
            error
        );

        return {
            success: false,
            message: "Phone verification failed"
        };
    }
};


// ======================================================
// EXPORT FUNCTIONS
// ======================================================

module.exports = {
    verifyEmailOtp,
    verifyPhoneOtp
};
