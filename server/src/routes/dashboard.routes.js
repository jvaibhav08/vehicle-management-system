const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");

const {
    getDashboard
} = require("../controllers/dashboard.controller");

const router = express.Router();

router.get(
    "/",
    authenticateUser,
    getDashboard
);

module.exports = router;