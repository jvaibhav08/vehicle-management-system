const vehicleModel = require("../models/vehicle.model");
const AppError = require("../utils/AppError");
const { validateVehicleNumber } = require("../utils/vehicleValidator");

// ======================================================
// ADD VEHICLE
// ======================================================

const addVehicle = async (vehicleData) => {

    // Validate vehicle number before inserting
    const validation = validateVehicleNumber(
        vehicleData.vehicle_number
    );

    if (!validation.valid) {
        throw new AppError(
            validation.message,
            400
        );
    }

    const result = await vehicleModel.addVehicle(
        vehicleData
    );

    return result;
};


// ======================================================
// GET ALL VEHICLES
// ======================================================

const getVehicles = async (userId) => {

    const vehicles = await vehicleModel.getVehicles(
        userId
    );

    return vehicles;
};


// ======================================================
// GET SINGLE VEHICLE
// ======================================================

const getVehicle = async (vehicleId, userId) => {

    return await vehicleModel.getVehicle(
        vehicleId,
        userId
    );
};


// ======================================================
// UPDATE VEHICLE
// ======================================================

const updateVehicle = async (
    vehicleId,
    userId,
    updateData
) => {

    const allowedFields = [
        "vehicle_number",
        "vehicle_name",
        "vehicle_type",
        "registration_date",
        "rc_status"
    ];

    const fieldsToUpdate = Object.keys(updateData).filter(
        (field) => allowedFields.includes(field)
    );

    if (fieldsToUpdate.length === 0) {
        throw new AppError(
            "No valid field provided for update",
            400
        );
    }

    // Validate vehicle number ONLY if it is being changed
    if (fieldsToUpdate.includes("vehicle_number")) {

        const validation = validateVehicleNumber(
            updateData.vehicle_number
        );

        if (!validation.valid) {
            throw new AppError(
                validation.message,
                400
            );
        }
    }

    const result = await vehicleModel.updateVehicle(
        vehicleId,
        userId,
        updateData,
        fieldsToUpdate
    );

    if (result.affectedRows === 0) {
        throw new AppError(
            "Vehicle not found",
            404
        );
    }

    return result;
};


// ======================================================
// DELETE VEHICLE
// ======================================================

const deleteVehicle = async (
    vehicleId,
    userId
) => {

    const result = await vehicleModel.deleteVehicle(
        vehicleId,
        userId
    );

    if (result.affectedRows === 0) {
        throw new AppError(
            "Vehicle not found",
            404
        );
    }

    return result;
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    addVehicle,
    getVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
};