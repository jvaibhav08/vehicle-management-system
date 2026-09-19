const express = require("express");

const {
    authenticateUser
} = require("../middleware/auth.middleware");

const {
    uploadInsuranceDocument
} = require("../middleware/insuranceDocument.middleware");

const {
    addInsurance,
    getAllActiveInsurance,
    getInsuranceByVehicleId,
    getInsuranceById,
    updateInsurance,
    getInsurancePolicyDocument,
    replaceInsurancePolicyDocument,
    deleteInsurancePolicyDocument
} = require("../controllers/insurance.controller");
const {
    validateNoQueryParameters,
    validateNoBodyFields,
    validateIdParameter,
    validateInsuranceCreate,
    validateInsuranceUpdate,
    validateDocumentUpload
} = require("../middleware/requestValidation.middleware");

const router = express.Router();

// ======================================================
// POST - ADD / RENEW INSURANCE
// ======================================================

router.post(
    "/",
    authenticateUser,
    validateNoQueryParameters,
    uploadInsuranceDocument,
    validateDocumentUpload("policy"),
    validateInsuranceCreate,
    addInsurance
);

// ======================================================
// GET - ALL ACTIVE INSURANCE POLICIES
// ======================================================

router.get(
    "/",
    authenticateUser,
    validateNoQueryParameters,
    getAllActiveInsurance
);

// ======================================================
// GET SINGLE INSURANCE POLICY
// ======================================================

router.get(
    "/policy/:insuranceId/document",
    authenticateUser,
    validateNoQueryParameters,
    validateIdParameter("insuranceId"),
    getInsurancePolicyDocument
);

router.delete(
    "/policy/:insuranceId/document",
    authenticateUser,
    validateNoQueryParameters,
    validateIdParameter("insuranceId"),
    deleteInsurancePolicyDocument
);

router.put(
    "/policy/:insuranceId/document",
    authenticateUser,
    validateNoQueryParameters,
    validateIdParameter("insuranceId"),
    uploadInsuranceDocument,
    validateDocumentUpload("policy"),
    validateNoBodyFields,
    replaceInsurancePolicyDocument
);

router.get(
    "/policy/:insuranceId",
    authenticateUser,
    validateNoQueryParameters,
    validateIdParameter("insuranceId"),
    getInsuranceById
);

// ======================================================
// GET - INSURANCE BY VEHICLE
// ======================================================

router.get(
    "/:vehicleId",
    authenticateUser,
    validateNoQueryParameters,
    validateIdParameter("vehicleId"),
    getInsuranceByVehicleId
);

// ======================================================
// PUT - CORRECT INSURANCE DETAILS
// ======================================================

router.put(
    "/:insuranceId",
    authenticateUser,
    validateNoQueryParameters,
    validateIdParameter("insuranceId"),
    validateInsuranceUpdate,
    updateInsurance
);

module.exports = router;
