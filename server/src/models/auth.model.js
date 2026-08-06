const db = require("../config/db");

const findByEmail = async (email) => {

    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows;

};

const createUser = async (userData) => {

    const [result] = await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [
            userData.name,
            userData.email,
            userData.password,
            userData.role
        ]
    );

    return result;

};

module.exports = {
    findByEmail,
    createUser
};