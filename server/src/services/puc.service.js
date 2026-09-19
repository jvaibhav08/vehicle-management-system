const pucModel = require("../models/puc.model");
const vehicleModel = require("../models/vehicle.model");
const AppError = require("../utils/AppError");
const fs = require("fs");
const path = require("path");
const { UPLOAD_ROOT } = require("../middleware/pucDocument.middleware");

const getDocumentPath = (puc) =>
    puc.document_path || puc.certificate_file || null;

const getDocumentName = (documentPath) => {
    if (!documentPath) {
        return null;
    }

    const fileName = path.basename(documentPath);
    const separatorIndex = fileName.indexOf("--");

    return separatorIndex >= 0
        ? fileName.slice(separatorIndex + 2)
        : fileName;
};

const withDocumentMetadata = (puc) => {
    const documentPath = getDocumentPath(puc);

    return {
        ...puc,
        document_path: documentPath,
        document_name: getDocumentName(documentPath)
    };
};

const verifyDocumentReference = async (pucId, documentPath) => {
    if (!documentPath) {
        return;
    }

    const savedPuc = await pucModel.getPucById(pucId);

    if (!savedPuc || getDocumentPath(savedPuc) !== documentPath) {
        throw new AppError("Failed to save PUC document", 500);
    }
};

const verifyStoredDocument = async (documentPath) => {
    if (!documentPath) {
        return;
    }

    const absolutePath = path.resolve(UPLOAD_ROOT, "..", documentPath);
    const uploadBase = path.resolve(UPLOAD_ROOT, "..");

    if (!absolutePath.startsWith(`${uploadBase}${path.sep}`)) {
        throw new AppError("Invalid PUC document path", 400);
    }

    try {
        await fs.promises.access(absolutePath, fs.constants.R_OK);
    } catch (error) {
        throw new AppError("PUC document could not be stored", 500);
    }
};

const addPuc = async (pucData, userId, documentPath) => {

    if (
        documentPath &&
        !(await pucModel.hasDocumentPathColumn())
    ) {
        throw new AppError(
            "PUC document storage requires the document_path database migration",
            400
        );
    }

    await verifyStoredDocument(documentPath);

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
        const result = await pucModel.addPuc({
            ...pucData,
            document_path: documentPath || null
        });

        if (result.affectedRows === 0) {
            throw new AppError("Failed to save PUC certificate", 500);
        }

        await verifyDocumentReference(result.insertId, documentPath);

        return {
            action: "created",
            result,
            puc: withDocumentMetadata(await pucModel.getPucById(result.insertId))
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
    const renewalData = {
        ...pucData,
        ...(documentPath ? { document_path: documentPath } : {})
    };

    const result = await pucModel.updatePuc(
        vehicleId,
        renewalData
    );

    await verifyDocumentReference(existingPuc.id, documentPath);

    if (documentPath) {
        await removeDocument(getDocumentPath(existingPuc));
    }

    return {
        action: "renewed",
        result,
        puc: withDocumentMetadata(await pucModel.getPucById(existingPuc.id))
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
        ...withDocumentMetadata(puc),
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
        ...withDocumentMetadata(puc),
        ...pucStatus
    };
};

// ======================================================
// UPDATE PUC - CORRECTION
// ======================================================

const updatePuc = async (
    pucId,
    pucData,
    userId,
    documentPath
) => {

    if (
        documentPath &&
        !(await pucModel.hasDocumentPathColumn())
    ) {
        throw new AppError(
            "PUC document storage requires the document_path database migration",
            400
        );
    }

    await verifyStoredDocument(documentPath);

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

    const shouldDeleteDocument = pucData.deleteDocument === "true";

    if (documentPath) {
        updatedPuc.document_path = documentPath;
    } else if (shouldDeleteDocument) {
        updatedPuc.document_path = null;
    }


    // --------------------------------------------------
    // 7. Update PUC
    // --------------------------------------------------

    const result = await pucModel.updatePucById(
        pucId,
        updatedPuc
    );

    await verifyDocumentReference(pucId, documentPath);

    if (documentPath || shouldDeleteDocument) {
        await removeDocument(getDocumentPath(puc));
    }

    return {
        action: "updated",
        result,
        puc: withDocumentMetadata(await pucModel.getPucById(pucId))
    };
};

const getAllPuc = async (userId) => {

    const pucRecords = await pucModel.getAllPuc(userId);

    const pucWithStatus = pucRecords.map((puc) => {
        if (!puc.expiry_date){

            return {
                ...withDocumentMetadata(puc),
                daysRemaining: null,
                status: "no_puc"
            };
        }
        const pucStatus = getPucStatus(puc.expiry_date);

        return {
            ...withDocumentMetadata(puc),
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

const getPucDocument = async (pucId, userId) => {

    const puc = await getPucById(pucId, userId);

    const documentPath = getDocumentPath(puc);

    if (!documentPath) {
        throw new AppError("PUC document not found", 404);
    }

    const absolutePath = path.resolve(UPLOAD_ROOT, "..", documentPath);
    const uploadBase = path.resolve(UPLOAD_ROOT, "..");

    if (!absolutePath.startsWith(`${uploadBase}${path.sep}`)) {
        throw new AppError("PUC document not found", 404);
    }

    try {
        await fs.promises.access(absolutePath, fs.constants.R_OK);
    } catch (error) {
        throw new AppError("PUC document not found", 404);
    }

    return {
        absolutePath,
        downloadName: `PUC-document${path.extname(documentPath)}`
    };
};

const deletePucDocument = async (pucId, userId) => {

    const puc = await getPucById(pucId, userId);

    const documentPath = getDocumentPath(puc);

    if (!documentPath) {
        throw new AppError("PUC document not found", 404);
    }

    const result = await pucModel.updatePucById(pucId, {
        certificate_number: puc.certificate_number,
        expiry_date: puc.expiry_date,
        document_path: null
    });

    if (result.affectedRows === 0) {
        throw new AppError("Failed to delete PUC document", 500);
    }

    const savedPuc = await pucModel.getPucById(pucId);

    if (getDocumentPath(savedPuc)) {
        throw new AppError("Failed to delete PUC document", 500);
    }

    await removeDocument(documentPath);
};

const removeDocument = async (documentPath) => {
    if (!documentPath) {
        return;
    }

    const absolutePath = path.resolve(UPLOAD_ROOT, "..", documentPath);
    const uploadBase = path.resolve(UPLOAD_ROOT, "..");

    if (absolutePath.startsWith(`${uploadBase}${path.sep}`)) {
        await fs.promises.unlink(absolutePath).catch(() => undefined);
    }
};

module.exports = {
    addPuc,
    getPuc,
    getPucById,
    getAllPuc,
    updatePuc,
    getPucDocument,
    deletePucDocument
};
