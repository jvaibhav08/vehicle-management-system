const reportsService = require("../services/reports.service");

// ======================================================
// GET VEHICLE REPORT
// ======================================================

const getVehicleReport = async (req, res, next) => {
    try {

        const userId = req.user.id;

        const report =
            await reportsService.getVehicleReport(
                userId
            );

        return res.status(200).json({
            success: true,
            message:
                "Vehicle report data fetched successfully",
            data: report
        });

    } catch (error) {

        next(error);

    }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    getVehicleReport
};