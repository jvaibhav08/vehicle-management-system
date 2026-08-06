const insuranceService = require("../services/insurance.service");

const addInsurance = async (req, res, next) => {
    try {
        const insuranceData = req.body;
        const userId = req.user.id;

        const result = await insuranceService.addInsurance(
            insuranceData,
            userId
        );

        return res.status(201).json({
            success: true,
            message: "Insurance added successfully",
            data: result
        });

    } catch (error) {
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

module.exports = {
    addInsurance,
    getInsuranceByVehicleId,
    getInsuranceById,
    updateInsurance
};