const db = require("../config/db");

// ======================================================
// TOTAL VEHICLES
// ======================================================

const getTotalVehicles = async (userId) => {

    const [rows] = await db.execute(
        `
        SELECT
            COUNT(*) AS totalVehicles
        FROM vehicles
        WHERE user_id = ?
        `,
        [userId]
    );

    return rows[0];

};

// ======================================================
// GET VEHICLE INSURANCE DATA
// ======================================================

const getVehicleInsuranceData = async (userId) => {

    const query = `
        SELECT
            v.id AS vehicle_id,
            v.vehicle_number,
            i.insurance_type,
            i.expiry_date

        FROM vehicles v

        LEFT JOIN insurance i
            ON v.id = i.vehicle_id
            AND i.status = 'active'

        WHERE v.user_id = ?

        ORDER BY
            v.id,
            i.insurance_type
    `;

    const [rows] = await db.execute(
        query,
        [userId]
    );

    return rows;

};

// ======================================================
// PUC SUMMARY
// ======================================================

const getPucSummary = async (userId) => {

    const query = `
        SELECT

            SUM(
                CASE
                    WHEN p.expiry_date < CURDATE()
                    THEN 1
                    ELSE 0
                END
            ) AS expired,

            SUM(
                CASE
                    WHEN p.expiry_date >= CURDATE()
                    AND p.expiry_date <= DATE_ADD(
                        CURDATE(),
                        INTERVAL 30 DAY
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS expiringSoon,

            SUM(
                CASE
                    WHEN p.expiry_date > DATE_ADD(
                        CURDATE(),
                        INTERVAL 30 DAY
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS valid,

            SUM(
                CASE
                    WHEN p.id IS NULL
                    THEN 1
                    ELSE 0
                END
            ) AS noPuc

        FROM vehicles v

        LEFT JOIN puc p
            ON v.id = p.vehicle_id

        WHERE v.user_id = ?
    `;

    const [rows] = await db.execute(
        query,
        [userId]
    );

    return rows[0];

};

// ======================================================
// RC STATUS SUMMARY
// ======================================================

const getRcSummary = async (userId) => {
    const [rows] = await db.execute(
        `
        SELECT
            SUM(
                CASE
                    WHEN rc_status = 'Received'
                    THEN 1
                    ELSE 0
                END
            ) AS rcReceived,

            SUM(
                CASE
                    WHEN rc_status = 'Pending'
                    THEN 1
                    ELSE 0
                END
            ) AS rcPending

        FROM vehicles

        WHERE user_id = ?
        `,
        [userId]
    );

    return rows[0];
};

// ======================================================
// MODULE EXPORTS
// ======================================================

module.exports = {
    getTotalVehicles,
    getVehicleInsuranceData,
    getPucSummary,
    getRcSummary
};