const authService = require("../services/auth.service");


// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {

    const userData = req.body;

    const result =
        await authService.registerUser(userData);

    res.json(result);
};


// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {

    const loginData = req.body;

    const result =
        await authService.loginUser(loginData);

    res.json(result);
};


// ======================================================
// VERIFY EMAIL
// ======================================================

const verifyEmail = async (req, res) => {

    const { email, otp } = req.body;

    const result =
        await authService.verifyEmail(
            email,
            otp
        );

    res.json(result);
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    registerUser,

    loginUser,

    verifyEmail
};