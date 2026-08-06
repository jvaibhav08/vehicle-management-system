const pucModel = require("../models/puc.model");
const vehicleModel = require("../models/vehicle.model");
const AppError = require("../utils/AppError");

const addPuc = async (pucData, userId) => {

    const {
        vehicle_id,
        certificate_number,
        expiry_date
    } = pucData;

    if (!vehicle_id || !certificate_number || !expiry_date) {
        throw new AppError(
            "Vehicle ID, certificate number and expiry date are required",
            400
        );
    }

    const vehicleId = vehicle_id;

    // Check whether this vehicle belongs to logged-in user
    const vehicle = await vehicleModel.getVehicle(
        vehicleId,
        userId
    );

    if (!vehicle) {
        throw new AppError(
            "Vehicle not found",
            404
        );
    }

    // Convert submitted expiry date into Date object
    const expiryDate = new Date(pucData.expiry_date);

    if (isNaN(expiryDate.getTime())) {
        throw new AppError(
            "Invalid expiry date",
            400
        );
    }

    // Get today's date
    //const today = new Date();

    // Remove current time because we only want to compare dates
    //today.setHours(0, 0, 0, 0);
    const now = new Date();

    const today = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    ));

    // Reject already expired certificate
    if (expiryDate < today) {
        throw new AppError(
            "PUC certificate has already expired",
            400
        );
    }

    // Check whether this vehicle already has a PUC
    const existingPuc = await pucModel.getPucByVehicleId(
        vehicleId
    );

    // No existing PUC = first-time PUC
    if (!existingPuc) {
        const result = await pucModel.addPuc(pucData);

        return {
            action: "created",
            result
        };
    }

    // Handle PUC renewal
    const existingExpiryDate = new Date(
        existingPuc.expiry_date
    );

    const existingExpiryUTC = new Date(Date.UTC(
        existingExpiryDate.getFullYear(),
        existingExpiryDate.getMonth(),
        existingExpiryDate.getDate()
    ));

    // Reject same or older PUC
    if (expiryDate <= existingExpiryUTC) {
        throw new AppError(
            "New PUC expiry date must be later than the existing PUC",
            409
        );
    }

    // Valid renewal
    const result = await pucModel.updatePuc(
        vehicleId,
        pucData
    );

    return {
        action: "renewed",
        result
    };
};

const getPuc = async (vehicleId, userId) => {

    const vehicle = await vehicleModel.getVehicle(
        vehicleId,
        userId
    );

    if (!vehicle) {
        throw new AppError(
            "Vehicle not found",
            404
        );
    }

    const puc = await pucModel.getPucByVehicleId(vehicleId);

    if (!puc) {
        throw new AppError(
            "PUC not found",
            404
        );
    }

    const pucStatus = getPucStatus(puc.expiry_date);

    return {
        ...puc,
        ...pucStatus
    };
};

// ======================================================
// GET SINGLE PUC BY ID
// ======================================================

const getPucById = async (
    pucId,
    userId
) => {

    // --------------------------------------------------
    // 1. Find PUC certificate
    // --------------------------------------------------

    const puc = await pucModel.getPucById(
        pucId
    );

    if (!puc) {
        throw new AppError(
            "PUC not found",
            404
        );
    }


    // --------------------------------------------------
    // 2. Verify vehicle ownership
    // --------------------------------------------------

    const vehicle = await vehicleModel.getVehicle(
        puc.vehicle_id,
        userId
    );

    if (!vehicle) {
        throw new AppError(
            "PUC not found",
            404
        );
    }


    // --------------------------------------------------
    // 3. Calculate current PUC status
    // --------------------------------------------------

    const pucStatus = getPucStatus(
        puc.expiry_date
    );


    // --------------------------------------------------
    // 4. Return PUC with calculated status
    // --------------------------------------------------

    return {
        ...puc,
        ...pucStatus
    };
};

// ======================================================
// UPDATE PUC - CORRECTION
// ======================================================

const updatePuc = async (
    pucId,
    pucData,
    userId
) => {

    // --------------------------------------------------
    // 1. Find existing PUC
    // --------------------------------------------------

    const puc = await pucModel.getPucById(
        pucId
    );

    if (!puc) {
        throw new AppError(
            "PUC not found",
            404
        );
    }


    // --------------------------------------------------
    // 2. Verify vehicle ownership
    // --------------------------------------------------

    const vehicle = await vehicleModel.getVehicle(
        puc.vehicle_id,
        userId
    );

    if (!vehicle) {
        throw new AppError(
            "PUC not found",
            404
        );
    }


    // --------------------------------------------------
    // 3. Extract editable fields
    // --------------------------------------------------

    const {
        certificate_number,
        expiry_date
    } = pucData;


    // --------------------------------------------------
    // 4. Validate required fields
    // --------------------------------------------------

    if (!certificate_number || !expiry_date) {
        throw new AppError(
            "Certificate number and expiry date are required",
            400
        );
    }


    // --------------------------------------------------
    // 5. Validate expiry date
    // --------------------------------------------------

    const expiryDate = new Date(expiry_date);

    if (isNaN(expiryDate.getTime())) {
        throw new AppError(
            "Invalid expiry date",
            400
        );
    }

    const now = new Date();

    const today = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    ));

    if (expiryDate < today) {
        throw new AppError(
            "PUC certificate has already expired",
            400
        );
    }


    // --------------------------------------------------
    // 6. Prepare safe update data
    // --------------------------------------------------

    const updatedPuc = {
        certificate_number,
        expiry_date
    };


    // --------------------------------------------------
    // 7. Update PUC
    // --------------------------------------------------

    const result = await pucModel.updatePucById(
        pucId,
        updatedPuc
    );

    return {
        action: "updated",
        result
    };
};

const getAllPuc = async (userId) => {

    const pucRecords = await pucModel.getAllPuc(userId);

    const pucWithStatus = pucRecords.map((puc) => {
        if (!puc.expiry_date){

            return {
                ...puc,
                daysRemaining: null,
                status: "no_puc"
            };
        }
        const pucStatus = getPucStatus(puc.expiry_date);

        return {
            ...puc,
            ...pucStatus
        };
    });
    return pucWithStatus;
};


const getPucStatus = (expiryDate) => {
    
    const expiry = new Date(expiryDate);
    const now = new Date();

    const expiryUTC = new Date(Date.UTC(

    expiry.getFullYear(),
    expiry.getMonth(),
    expiry.getDate()

    ));

    const todayUTC = new Date(Date.UTC(

        now.getFullYear(),
        now.getMonth(),
        now.getDate()

    ));

    const miliSecondsPerDay = 1000 * 60 * 60 * 24;

    const daysRemaining = Math.ceil(
        (expiryUTC - todayUTC) / miliSecondsPerDay
    );

    if(daysRemaining < 0) {

        return {
            daysRemaining,
            status: "expired"
        };
    }

    if(daysRemaining === 0){

        return {
            daysRemaining,
            status: "expires_today"
        };
    }

    if(daysRemaining <= 30){

        return{
            daysRemaining,
            status: "expiring_soon"
        };
    }

    return {
        daysRemaining,
        status: "valid"
    };

}

module.exports = {
    addPuc,
    getPuc,
    getPucById,
    getAllPuc,
    updatePuc
};