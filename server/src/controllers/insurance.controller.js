const insuranceService = require("../services/insurance.service");
const {
    getDocumentReference,
    removeUploadedFile
} = require("../middleware/insuranceDocument.middleware");

const addInsurance = async (req, res, next) => {
    try {
        const insuranceData = {
            ...req.body,
            covers_own_damage: req.body.covers_own_damage === "true"
                ? true
                : req.body.covers_own_damage === "false"
                    ? false
                    : req.body.covers_own_damage,
            covers_third_party: req.body.covers_third_party === "true"
                ? true
                : req.body.covers_third_party === "false"
                    ? false
                    : req.body.covers_third_party
        };
        const userId = req.user.id;
        const policyFile = req.file;

        const result = await insuranceService.addInsurance(
            insuranceData,
            userId,
            getDocumentReference(policyFile, userId)
        );

        const insurance = result.result?.insertId
            ? await insuranceService.getInsuranceById(
                result.result.insertId,
                userId
            )
            : null;

        return res.status(201).json({
            success: true,
            message: "Insurance added successfully",
            data: {
                ...result,
                ...(insurance || {}),
                insurance
            }
        });
    } catch (error) {
        await removeUploadedFile(req.file);
        next(error);
    }
};

// ======================================================
// GET INSURANCE BY VEHICLE
// ======================================================

const getInsuranceByVehicleId = async (req, res, next) => {
    try {
        // Get vehicle ID from URL
        const vehicleId = req.params.vehicleId;

        // Get logged-in user's ID from auth middleware
        const userId = req.user.id;

        // Call service
        const insurance =
            await insuranceService.getInsuranceByVehicleId(
                vehicleId,
                userId
            );

        // Send response
        res.status(200).json({
            success: true,
            message: "Insurance fetched successfully",
            data: insurance
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET SINGLE INSURANCE POLICY
// ======================================================

const getInsuranceById = async (req, res, next) => {
    try {
        // Insurance ID from URL
        const insuranceId = req.params.insuranceId;

        // Logged-in user ID
        const userId = req.user.id;

        // Fetch insurance policy
        const insurance =
            await insuranceService.getInsuranceById(
                insuranceId,
                userId
            );

        return res.status(200).json({
            success: true,
            message: "Insurance policy fetched successfully",
            data: insurance
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// UPDATE INSURANCE
// ======================================================

const updateInsurance = async (req, res, next) => {
    try {
        // Insurance ID from URL
        const insuranceId = req.params.insuranceId;

        // Logged-in user ID
        const userId = req.user.id;

        // Allowed update data from request body
        const insuranceData = req.body;

        // Call service
        const result = await insuranceService.updateInsurance(
            insuranceId,
            insuranceData,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Insurance updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET ALL ACTIVE INSURANCE POLICIES
// ======================================================

const getAllActiveInsurance = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const insurance =
            await insuranceService.getAllActiveInsurance(
                userId
            );

        return res.status(200).json({
            success: true,
            message: "Active insurance records fetched successfully",
            data: insurance
        });
    } catch (error) {
        next(error);
    }
};

const getInsurancePolicyDocument = async (req, res, next) => {
    try {
        const document = await insuranceService.getInsurancePolicyDocument(req.params.insuranceId, req.user.id);
        return res.download(document.absolutePath, document.downloadName);
    } catch (error) {
        next(error);
    }
};

const replaceInsurancePolicyDocument = async (req, res, next) => {
    try {
        const policy = await insuranceService.replaceInsurancePolicyDocument(
            req.params.insuranceId,
            req.user.id,
            getDocumentReference(req.file, req.user.id)
        );
        return res.status(200).json({ success: true, message: "Insurance policy document updated successfully", data: policy });
    } catch (error) {
        await removeUploadedFile(req.file);
        next(error);
    }
};

const deleteInsurancePolicyDocument = async (req, res, next) => {
    try {
        await insuranceService.deleteInsurancePolicyDocument(req.params.insuranceId, req.user.id);
        return res.status(200).json({ success: true, message: "Insurance policy document deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addInsurance,
    getInsuranceByVehicleId,
    getInsuranceById,
    updateInsurance,
    getAllActiveInsurance,
    getInsurancePolicyDocument,
    replaceInsurancePolicyDocument,
    deleteInsurancePolicyDocument
};
