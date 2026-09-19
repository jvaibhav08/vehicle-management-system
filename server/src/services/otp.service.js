const bcrypt = require("bcrypt");
const otpModel = require("../models/otp.model");
const emailService = require("./email.service");


// ======================================================
// GENERATE OTP
// ======================================================

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


// ======================================================
// CREATE EMAIL VERIFICATION OTP
// ======================================================

const createEmailVerificationOtp = async (user) => {

    try {

        // Generate 6-digit OTP
        const otp = generateOtp();

        // Hash OTP before storing
        const otpHash = await bcrypt.hash(otp, 10);

        // OTP expires after 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // Store OTP hash
        await otpModel.createOtp(
            user.id,
            otpHash,
            "email_verification",
            expiresAt
        );

        // Send OTP email
        const emailResult = await emailService.sendEmail(
            user.email,
            "Verify Your VMS Account",
            `Hello ${user.name},

Your Vehicle Management System verification OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not create this account, you can safely ignore this email.

Regards,

Vehicle Management System`
        );

        if (!emailResult.success) {

            return {
                success: false,
                message: "Failed to send verification email"
            };
        }

        return {
            success: true,
            message: "Verification OTP sent successfully"
        };

    } catch (error) {

        console.log(
            "OTP creation error:",
            error
        );

        return {
            success: false,
            message: "Failed to create verification OTP"
        };
    }
};


// ======================================================
// CREATE LOGIN OTP
// ======================================================

const createLoginOtp = async (user) => {

    try {

        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await otpModel.createOtp(
            user.id,
            otpHash,
            "login",
            expiresAt
        );

        const emailResult = await emailService.sendEmail(
            user.email,
            "Your VMS Login OTP",
            `Hello ${user.name},

Your Vehicle Management System login OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not try to log in, you can safely ignore this email.

Regards,

Vehicle Management System`
        );

        if (!emailResult.success) {
            return {
                success: false,
                message: "Failed to send login OTP"
            };
        }

        return {
            success: true,
            message: "Login OTP sent successfully"
        };

    } catch (error) {

        console.log(
            "Login OTP creation error:",
            error
        );

        return {
            success: false,
            message: "Failed to create login OTP"
        };
    }
};


// ======================================================
// VERIFY EMAIL OTP
// ======================================================

const verifyEmailOtp = async (userId, otp) => {

    try {

        // --------------------------------------------------
        // 1. Find latest valid OTP
        // --------------------------------------------------

        const otpRows = await otpModel.findValidOtp(
            userId,
            "email_verification"
        );

        if (otpRows.length === 0) {

            return {
                success: false,
                message: "OTP is invalid or expired"
            };
        }

        const otpRecord = otpRows[0];


        // --------------------------------------------------
        // 2. Check attempt limit
        // --------------------------------------------------

        if (otpRecord.attempts >= 5) {

            return {
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP."
            };
        }


        // --------------------------------------------------
        // 3. Compare entered OTP with stored hash
        // --------------------------------------------------

        const isOtpValid = await bcrypt.compare(
            otp.toString(),
            otpRecord.otp_hash
        );


        // --------------------------------------------------
        // 4. Incorrect OTP
        // --------------------------------------------------

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
        // 5. OTP is correct
        // --------------------------------------------------

        await otpModel.deleteOtp(
            otpRecord.id
        );


        return {
            success: true,
            message: "OTP verified successfully"
        };

    } catch (error) {

        console.log(
            "OTP verification error:",
            error
        );

        return {
            success: false,
            message: "Failed to verify OTP"
        };
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createEmailVerificationOtp,
    createLoginOtp,

    verifyEmailOtp
};
