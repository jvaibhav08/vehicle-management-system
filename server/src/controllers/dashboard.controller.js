const dashboardService = require("../services/dashboard.service");

// ======================================================
// GET DASHBOARD
// ======================================================

const getDashboard = async (req, res, next) =>{

    try{
        const userId = req.user.id;

        const dashboard = 
            await dashboardService.getDashboard(
                userId
            );
        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: dashboard
        });
    } catch (error) {
        next(error);
    }

};

module.exports = {
    getDashboard
};