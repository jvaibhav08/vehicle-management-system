const vehicleService = require("../services/vehicle.service");

const addVehicle = async (req, res) => {

    try{

    const vehicleData = req.body;
    vehicleData.user_id = req.user.id;

    const result = await vehicleService.addVehicle(vehicleData);

    res.status(201).json({
        success: true,
        message: "Vehicle added successfully",
        data: result
    });
}
catch (error) {

    console.log(error);

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
            success: false,
            message: "Vehicle number already exists."
        });
    }

    return res.status(500).json({
        success: false,
        message: "Something went wrong"
    });

}
};

const getVehicles = async (req, res) => {

    try{
        const userId = req.user.id;

        const vehicles = await vehicleService.getVehicles(userId);
        
        return res.status(200).json({
            success: true,
            message: "Vehicles fetched successfully",
            data: vehicles
        });
    }
    catch(error){
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const getVehicle = async (req, res) => {

    try{

    const vehicleId = req.params.id;
    const userId = req.user.id;

    const vehicle = await vehicleService.getVehicle(vehicleId,userId);

    if(!vehicle){
        return res.status(404).json({
            success: false,
            message: "Vehicle not found"
        });
    }
return res.status(200).json({
        success: true,
        message: "Vehicle fetched successfully",
        data:vehicle
    });
}
catch(error){

    console.log(error);
    return res.status(500).json({
        success: false,
        message: "Internal Server error"
    });
}
};

const updateVehicle = async (req, res, next) => {

    try {
        const vehicleId = req.params.id;
        const userId = req.user.id;
        const updateData = req.body;

         if (!updateData || Object.keys(updateData).length === 0){
            return res.status(400).json({
                success: false,
                message: "No update data provided"
            });
        }
        const result = await vehicleService.updateVehicle(
            vehicleId,
            userId,
            updateData
        );
        return res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};

const deleteVehicle = async (req, res, next) => {
    try {
        const vehicleId = req.params.id;
        const userId = req.user.id;

        const result = await vehicleService.deleteVehicle(
            vehicleId,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Vehicle successfully deleted"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    addVehicle,
    getVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
};