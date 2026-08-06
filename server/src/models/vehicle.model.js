const db = require("../config/db");

const addVehicle = async(vehicleData) => {

    const query =`
    INSERT INTO vehicles(
    user_id,
    vehicle_number,
    vehicle_name,
    vehicle_type,
    registration_date,
    rc_status
    )
    VALUES(?, ?, ?, ?, ?, ?)
    `;
    const values = [
        vehicleData.user_id,
        vehicleData.vehicle_number,
        vehicleData.vehicle_name,
        vehicleData.vehicle_type,
        vehicleData.registration_date,
        vehicleData.rc_status
    ];
    
    const [result] = await db.execute(query, values);
    return result;
    
};
const getVehicles = async (userId) => {

    const query = `
    select 
    id,
    vehicle_number,
    vehicle_name,
    vehicle_type,
    registration_date,
    rc_status
    FROM vehicles
    WHERE user_id = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    return rows;
};

const getVehicle = async(vehicleId, userId) => {
    const query = `
    SELECT 
        id,
        vehicle_number,
        vehicle_name,
        vehicle_type,
        registration_date,
        rc_status
        FROM vehicles
        where id = ?
        AND user_id = ?
    `;

    const [rows] = await db.execute(query, [vehicleId, userId]);
    return rows[0] || null;
};

const updateVehicle = async (
    vehicleId,
    userId,
    updateData,
    fieldsToUpdate
) => {

    const setFields =  fieldsToUpdate.map((field) =>{
        return `${field} = ?`
    });
    
    const setClause = setFields.join(", ");

    const query =`
        UPDATE vehicles
        SET ${setClause}
        WHERE id = ?
        AND user_id = ? 
    `;

    const values = fieldsToUpdate.map((field) => {
        return updateData[field];
    });
    values.push(vehicleId, userId);

    const [result] = await db.execute(query, values);

    return result;
};


const deleteVehicle = async (vehicleId, userId) => {

    const query = `
        DELETE FROM vehicles
        WHERE id = ?
        AND user_id = ?
    `;

    const values = [vehicleId, userId];

    const [result] = await db.execute(query, values);

    return result;
};

module.exports = {
    addVehicle,
    getVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
};
