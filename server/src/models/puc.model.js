const db = require("../config/db");

const getPucByVehicleId = async (vehicleId) => {

    const query = `
        SELECT *
        FROM puc
        WHERE vehicle_id = ?
    `;

    const [rows] = await db.execute(
        query,
        [vehicleId]
    );

    return rows[0];
};

// ======================================================
// GET PUC BY ID
// ======================================================

const getPucById = async (pucId) => {

    const [rows] = await db.execute(
        `SELECT *
         FROM puc
         WHERE id = ?`,
        [pucId]
    );

    return rows[0];
};

const addPuc = async (pucData) =>{
    const query = `
        INSERT INTO puc(
        vehicle_id,
        certificate_number,
        expiry_date)
        VALUES (?, ?, ?)
    `;
    const values = [
        pucData.vehicle_id,
        pucData.certificate_number,
        pucData.expiry_date
    ];

    const [result] = await db.execute(query, values);

    return result;


};

const updatePuc = async (vehicleId, pucData) => {

    const query = `
        UPDATE puc
        SET certificate_number = ?,
            expiry_date = ?
        WHERE vehicle_id = ?
    `;

    const values = [
        pucData.certificate_number,
        pucData.expiry_date,
        vehicleId
    ];

    const [result] = await db.execute(query, values);

    return result;
};

// ======================================================
// UPDATE PUC BY ID - CORRECTION
// ======================================================

const updatePucById = async (
    pucId,
    pucData
) => {

    const query = `
        UPDATE puc
        SET certificate_number = ?,
            expiry_date = ?
        WHERE id = ?
    `;

    const values = [
        pucData.certificate_number,
        pucData.expiry_date,
        pucId
    ];

    const [result] = await db.execute(
        query,
        values
    );

    return result;
};
const getAllPuc = async (userId) => {

    const [rows] = await db.execute(
        `SELECT
            v.id AS vehicle_id,
            v.vehicle_number,
            v.vehicle_name,
            p.id AS puc_id,
            p.certificate_number,
            p.expiry_date,
            p.created_at,
            p.updated_at
        FROM vehicles v
        LEFT JOIN puc p
            ON v.id = p.vehicle_id
        WHERE v.user_id = ?`,
        [userId]
    );

    return rows;
};

module.exports = {
    getPucByVehicleId,
    getPucById,
    addPuc,
    updatePuc,
    updatePucById,
    getAllPuc
};