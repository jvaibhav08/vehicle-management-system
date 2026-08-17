const db = require("../config/db");


// ======================================================
// GET ACTIVE INSURANCE POLICIES
// ======================================================

const getActiveInsuranceByVehicleId = async (vehicleId) => {

    const [rows] = await db.query(
        `SELECT *
         FROM insurance
         WHERE vehicle_id = ?
         AND status = 'active'`,
        [vehicleId]
    );

    return rows;
};


// ======================================================
// ADD NEW INSURANCE
// ======================================================

const addInsurance = async (insuranceData) => {

    const {
        vehicle_id,
        insurance_type,
        insurance_company,
        policy_number,
        expiry_date,
        status
    } = insuranceData;

    try {

        const [result] = await db.query(
            `INSERT INTO insurance
            (
                vehicle_id,
                insurance_type,
                insurance_company,
                policy_number,
                expiry_date,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                vehicle_id,
                insurance_type,
                insurance_company,
                policy_number,
                expiry_date,
                status
            ]
        );

        return result;

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            error.statusCode = 409;
            error.message = "Insurance policy number already exists";
        }

        throw error;
    }
};


// ======================================================
// UPDATE INSURANCE STATUS
// ======================================================

const updateInsuranceStatus = async (
    insuranceId,
    status
) => {

    const [result] = await db.query(
        `UPDATE insurance
         SET status = ?
         WHERE id = ?`,
        [status, insuranceId]
    );

    return result;
};


// ======================================================
// DELETE OLD PREVIOUS INSURANCE
// ======================================================

const deletePreviousInsurance = async (
    vehicleId,
    insuranceType
) => {

    const [result] = await db.query(
        `DELETE FROM insurance
         WHERE vehicle_id = ?
         AND insurance_type = ?
         AND status = 'previous'`,
        [vehicleId, insuranceType]
    );

    return result;
};

// ======================================================
// GET ALL INSURANCE POLICIES BY VEHICLE ID
// ======================================================

const getInsuranceByVehicleId = async (vehicleId) => {

    const [rows] = await db.query(
        `SELECT *
         FROM insurance
         WHERE vehicle_id = ?
         ORDER BY expiry_date DESC`,
        [vehicleId]
    );

    return rows;
};

// ======================================================
// UPDATE INSURANCE DETAILS
// ======================================================

// ======================================================
// UPDATE INSURANCE DETAILS
// ======================================================

const updateInsurance = async (
    insuranceId,
    insuranceData
) => {

    const {
        insurance_type,
        insurance_company,
        policy_number,
        expiry_date
    } = insuranceData;

    try {

        const [result] = await db.query(
            `UPDATE insurance
             SET insurance_type = ?,
                 insurance_company = ?,
                 policy_number = ?,
                 expiry_date = ?
             WHERE id = ?`,
            [
                insurance_type,
                insurance_company,
                policy_number,
                expiry_date,
                insuranceId
            ]
        );

        return result;

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            error.statusCode = 409;
            error.message =
                "Insurance policy number already exists";
        }

        throw error;
    }
};

// ======================================================
// GET INSURANCE BY ID
// ======================================================

const getInsuranceById = async (insuranceId) => {

    const [rows] = await db.query(
        `SELECT *
         FROM insurance
         WHERE id = ?`,
        [insuranceId]
    );

    return rows[0];
};

// ======================================================
// DELETE INSURANCE BY ID
// ======================================================

const deleteInsuranceById = async (insuranceId) => {

    const [result] = await db.query(
        `DELETE FROM insurance
         WHERE id = ?`,
        [insuranceId]
    );

    return result;
};

// ======================================================
// GET ALL ACTIVE INSURANCE POLICIES FOR LOGGED-IN USER
// ======================================================

const getAllActiveInsurance = async (userId) => {

    const [rows] = await db.query(
        `SELECT
            v.id AS vehicle_id,
            v.vehicle_number,
            v.vehicle_name,

            i.id AS insurance_id,
            i.insurance_company,
            i.insurance_type,
            i.policy_number,
            i.expiry_date,
            i.status

        FROM vehicles v

        INNER JOIN insurance i
            ON v.id = i.vehicle_id

        WHERE v.user_id = ?
        AND i.status = 'active'

        ORDER BY
            v.id,
            i.expiry_date DESC`,
        [userId]
    );

    return rows;
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    getActiveInsuranceByVehicleId,
    getInsuranceByVehicleId,
    getInsuranceById,
    addInsurance,
    updateInsurance,
    updateInsuranceStatus,
    deletePreviousInsurance,
    deleteInsuranceById,
    getAllActiveInsurance
};