const db = require("../config/db");

const createOtp = async (
    userId,
    otpHash,
    purpose,
    expiresAt
) => {

    const [result] = await db.query(
        `INSERT INTO otp_verifications
        (user_id, otp_hash, purpose, expires_at)
        VALUES (?, ?, ?, ?)`,
        [
            userId,
            otpHash,
            purpose,
            expiresAt
        ]
    );

    return result;
};

const findValidOtp = async (userId, purpose) => {

    const [rows] = await db.query(
        `SELECT *
         FROM otp_verifications
         WHERE user_id = ?
         AND purpose = ?
         AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [
            userId,
            purpose
        ]
    );

    return rows;
};

const incrementAttempts = async (otpId) => {

    const [result] = await db.query(
        `UPDATE otp_verifications
         SET attempts = attempts + 1
         WHERE id = ?`,
        [otpId]
    );

    return result;
};

const deleteOtp = async (otpId) => {

    const [result] = await db.query(
        `DELETE FROM otp_verifications
         WHERE id = ?`,
        [otpId]
    );

    return result;
};

module.exports = {
    createOtp,
    findValidOtp,
    incrementAttempts,
    deleteOtp
};