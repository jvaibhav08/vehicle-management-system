const crypto = require("crypto");
const bcrypt = require("bcrypt");

const phoneOtpModel = require("../models/phoneOtp.model");


// ======================================================
// OTP CONFIGURATION
// ======================================================

// OTP will remain valid for exactly 5 minutes.
const OTP_EXPIRY_MINUTES = 5;

// Number of digits in the OTP.
const OTP_LENGTH = 6;


// ======================================================
// GENERATE PHONE OTP
// ======================================================

const generatePhoneOtp = () => {

    // Generate a secure 6-digit OTP.
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;

    return crypto.randomInt(
        min,
        max + 1
    ).toString();

};


// ======================================================
// HASH PHONE OTP
// ======================================================

const hashPhoneOtp = async (otp) => {

    return await bcrypt.hash(
        otp,
        10
    );

};


// ======================================================
// VERIFY PHONE OTP
// ======================================================

const verifyPhoneOtp = async (
    otp,
    otpHash
) => {

    return await bcrypt.compare(
        otp,
        otpHash
    );

};


// ======================================================
// GET OTP EXPIRY TIME
// ======================================================

const getOtpExpiryTime = () => {

    const expiresAt = new Date();

    expiresAt.setMinutes(
        expiresAt.getMinutes() + OTP_EXPIRY_MINUTES
    );

    return expiresAt;

};


// ======================================================
// SEND PHONE OTP
// DEVELOPMENT MODE
// ======================================================

const sendPhoneOtp = async (
    userId,
    phone
) => {

    try {

        // --------------------------------------------------
        // Generate a new OTP.
        // --------------------------------------------------

        const otp = generatePhoneOtp();


        // --------------------------------------------------
        // Hash OTP before storing it in the database.
        // The actual OTP is never stored.
        // --------------------------------------------------

        const otpHash = await hashPhoneOtp(otp);


        // --------------------------------------------------
        // Set OTP expiry to exactly 5 minutes.
        // --------------------------------------------------

        const expiresAt = getOtpExpiryTime();


        // --------------------------------------------------
        // Remove any previous OTP for this user/phone.
        // Only the newest OTP should remain valid.
        // --------------------------------------------------

        await phoneOtpModel.deleteExistingPhoneOtps(
            userId,
            phone
        );


        // --------------------------------------------------
        // Save hashed OTP in database.
        // --------------------------------------------------

        await phoneOtpModel.createPhoneOtp(
            userId,
            phone,
            otpHash,
            expiresAt
        );


        return {
            success: true,
            message: "Phone OTP generated successfully"
        };

    } catch (error) {
        return {
            success: false,
            message: "Failed to generate phone OTP"
        };

    }

};


// ======================================================
// EXPORT FUNCTIONS
// ======================================================

module.exports = {

    generatePhoneOtp,
    hashPhoneOtp,
    verifyPhoneOtp,
    getOtpExpiryTime,
    sendPhoneOtp

};
