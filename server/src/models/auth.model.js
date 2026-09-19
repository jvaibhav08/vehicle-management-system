const db = require("../config/db");


// ======================================================
// FIND USER BY EMAIL
// ======================================================

const findByEmail = async (email) => {

    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows;
};


// ======================================================
// FIND USER BY PHONE
// ======================================================

const findByPhone = async (phone) => {

    const [rows] = await db.query(
        "SELECT * FROM users WHERE phone = ?",
        [phone]
    );

    return rows;
};


// ======================================================
// CREATE USER
// ======================================================

const createUser = async (userData) => {

    const [result] = await db.query(
        `INSERT INTO users
        (name, email, phone, password)
        VALUES (?, ?, ?, ?)`,
        [
            userData.name,
            userData.email,
            userData.phone,
            userData.password
        ]
    );

    return result;
};


// ======================================================
// MARK EMAIL AS VERIFIED
// ======================================================

const markEmailVerified = async (userId) => {

    const [result] = await db.query(
        `UPDATE users
         SET email_verified = 1
         WHERE id = ?`,
        [userId]
    );

    return result;
};


// ======================================================
// MARK PHONE AS VERIFIED
// ======================================================

const markPhoneVerified = async (userId) => {

    const [result] = await db.query(
        `UPDATE users
         SET phone_verified = 1
         WHERE id = ?`,
        [userId]
    );

    return result;
};


// ======================================================
// EXPORT FUNCTIONS
// ======================================================

module.exports = {

    findByEmail,
    findByPhone,

    createUser,

    markEmailVerified,
    markPhoneVerified

};