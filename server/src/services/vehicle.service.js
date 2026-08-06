const vehicleModel = require("../models/vehicle.model");
const AppError = require("../utils/AppError");


const addVehicle = async (vehicleData) => {

    const result = await vehicleModel.addVehicle(vehicleData);

    return result;
};

const getVehicles = async (userId) => {

    const vehicles = await vehicleModel.getVehicles(userId);

    return vehicles;
};


const getVehicle = async (vehicleId, userId) => {

    return await vehicleModel.getVehicle(vehicleId,userId);
};

const updateVehicle = async (vehicleId, userId, updateData) => {

    const allowedFields = [
        "vehicle_number",
        "vehicle_name",
        "vehicle_type",
        "registration_date",
        "rc_status"
    ];

    const fieldsToUpdate = Object.keys(updateData).filter((field) => {
        return allowedFields.includes(field);
    });

    if (fieldsToUpdate.length === 0) {
        throw new AppError(
            "No valid field provided for update",
            400
        );
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

const deleteVehicle = async (vehicleId, userId) => {

    const result = await vehicleModel.deleteVehicle(
        vehicleId,
        userId
    );

    if (result.affectedRows === 0) {
        throw new AppError("Vehicle not found", 404);
    }

    return result;
};

module.exports = {
    addVehicle,
    getVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
};