const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");

const {
    getVehicleReport
} = require("../controllers/reports.controller");

const router = express.Router();

// ======================================================
// VEHICLE REPORT
// ======================================================

router.get(
    "/vehicles",
    authenticateUser,
    getVehicleReport
);

module.exports = router;