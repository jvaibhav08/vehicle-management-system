const db = require("../config/db");


// ======================================================
// CREATE PHONE OTP
// ======================================================

const createPhoneOtp = async (
    userId,
    phone,
    otpHash,
    expiresAt
) => {

    const [result] = await db.query(
        `INSERT INTO phone_otps
        (user_id, phone, otp_hash, expires_at)
        VALUES (?, ?, ?, ?)`,
        [
            userId,
            phone,
            otpHash,
            expiresAt
        ]
    );

    return result;
};


// ======================================================
// FIND VALID PHONE OTP
// ======================================================

const findValidPhoneOtp = async (userId, phone) => {

    const [rows] = await db.query(
        `SELECT *
         FROM phone_otps
         WHERE user_id = ?
         AND phone = ?
         AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [
            userId,
            phone
        ]
    );

    return rows;
};


// ======================================================
// INCREMENT ATTEMPTS
// ======================================================

const incrementPhoneOtpAttempts = async (otpId) => {

    const [result] = await db.query(
        `UPDATE phone_otps
         SET attempts = attempts + 1
         WHERE id = ?`,
        [otpId]
    );

    return result;
};


// ======================================================
// DELETE PHONE OTP
// ======================================================

const deletePhoneOtp = async (otpId) => {

    const [result] = await db.query(
        `DELETE FROM phone_otps
         WHERE id = ?`,
        [otpId]
    );

    return result;
};


// ======================================================
// DELETE EXISTING OTPs FOR USER
// ======================================================

const deleteExistingPhoneOtps = async (userId, phone) => {

    const [result] = await db.query(
        `DELETE FROM phone_otps
         WHERE user_id = ?
         AND phone = ?`,
        [
            userId,
            phone
        ]
    );

    return result;
};


// ======================================================
// EXPORT FUNCTIONS
// ======================================================

module.exports = {

    createPhoneOtp,
    findValidPhoneOtp,
    incrementPhoneOtpAttempts,
    deletePhoneOtp,
    deleteExistingPhoneOtps

};