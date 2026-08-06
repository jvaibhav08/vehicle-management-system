const pucService = require("../services/puc.service");

const addPuc = async (req, res, next) => {

    try {
        const pucData = req.body;
        const userId = req.user.id;

        const result = await pucService.addPuc(
            pucData,
            userId
        );

        // First-time PUC
        if (result.action === "created") {
            return res.status(201).json({
                success: true,
                message: "PUC certificate added successfully",
                data: result.result
            });
        }

        // PUC renewal
        return res.status(200).json({
            success: true,
            message: "PUC certificate renewed successfully",
            data: result.result
        });
        

    } catch (error) {
        next(error);
    }
};

const getPuc = async (req, res, next) => {

    try {
        const vehicleId = req.params.vehicleId;
        const userId = req.user.id;

        const puc = await pucService.getPuc(
            vehicleId,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "PUC fetched successfully",
            data: puc
        });

    } catch (error) {
        next(error);
    }
};
// ======================================================
// GET SINGLE PUC BY ID
// ======================================================

const getPucById = async (req, res, next) => {

    try {

        const pucId = req.params.pucId;
        const userId = req.user.id;

        const puc = await pucService.getPucById(
            pucId,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "PUC certificate fetched successfully",
            data: puc
        });

    } catch (error) {
        next(error);
    }
};

// ======================================================
// UPDATE PUC - CORRECTION
// ======================================================

const updatePuc = async (req, res, next) => {

    try {

        const pucId = req.params.pucId;
        const pucData = req.body;
        const userId = req.user.id;

        const result = await pucService.updatePuc(
            pucId,
            pucData,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "PUC certificate updated successfully",
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const getAllPuc = async (req, res, next) => {

    try {
        
        const userId = req.user.id;

        const allPuc = await pucService.getAllPuc(userId);

        return res.status(200).json({
            success: true,
            message: "PUC records fetched successfully",
            data: allPuc
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    addPuc,
    getPuc,
    getPucById,
    updatePuc,
    getAllPuc
};