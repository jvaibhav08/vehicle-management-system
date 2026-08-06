const express = require("express");

const { authenticateUser } = require("../middleware/auth.middleware");

const {
    addInsurance,
    getInsuranceByVehicleId,
    getInsuranceById,
    updateInsurance
} = require("../controllers/insurance.controller");

const router = express.Router();


// ======================================================
// POST - ADD / RENEW INSURANCE
// ======================================================

router.post(
    "/",
    authenticateUser,
    addInsurance
);

// GET single insurance policy by insurance ID
router.get(
    "/policy/:insuranceId",
    authenticateUser,
    getInsuranceById
);


// ======================================================
// GET - INSURANCE BY VEHICLE
// ======================================================

router.get(
    "/:vehicleId",
    authenticateUser,
    getInsuranceByVehicleId
);


// ======================================================
// PUT - CORRECT INSURANCE DETAILS
// ======================================================

router.put(
    "/:insuranceId",
    authenticateUser,
    updateInsurance
);


module.exports = router;