const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/auth.controller");
const {
    loginRateLimit,
    registrationRateLimit
} = require("../middleware/authRateLimit.middleware");
const {
    validateRegistration,
    validateLogin,
    validateNoQueryParameters
} = require("../middleware/requestValidation.middleware");


// ======================================================
// REGISTER USER
// ======================================================

router.post(
    "/register",
    registrationRateLimit,
    validateNoQueryParameters,
    validateRegistration,
    registerUser
);


// ======================================================
// LOGIN USER
// ======================================================

router.post(
    "/login",
    loginRateLimit,
    validateNoQueryParameters,
    validateLogin,
    loginUser
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
