const db = require("../config/db");

// ======================================================
// GET PUC BY VEHICLE ID
// ======================================================

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
// Includes vehicle information
// ======================================================

const getPucById = async (pucId) => {
  const query = `
    SELECT
      p.*,
      v.vehicle_number,
      v.vehicle_name
    FROM puc p
    INNER JOIN vehicles v
      ON p.vehicle_id = v.id
    WHERE p.id = ?
  `;

  const [rows] = await db.execute(
    query,
    [pucId]
  );

  return rows[0];
};

// ======================================================
// ADD PUC
// ======================================================

const addPuc = async (pucData) => {
  const query = `
    INSERT INTO puc (
      vehicle_id,
      certificate_number,
      expiry_date
    )
    VALUES (?, ?, ?)
  `;

  const values = [
    pucData.vehicle_id,
    pucData.certificate_number,
    pucData.expiry_date,
  ];

  const [result] = await db.execute(
    query,
    values
  );

  return result;
};

// ======================================================
// UPDATE PUC BY VEHICLE ID
// ======================================================

const updatePuc = async (
  vehicleId,
  pucData
) => {
  const query = `
    UPDATE puc
    SET
      certificate_number = ?,
      expiry_date = ?
    WHERE vehicle_id = ?
  `;

  const values = [
    pucData.certificate_number,
    pucData.expiry_date,
    vehicleId,
  ];

  const [result] = await db.execute(
    query,
    values
  );

  return result;
};

// ======================================================
// UPDATE PUC BY ID
// ======================================================

const updatePucById = async (
  pucId,
  pucData
) => {
  const query = `
    UPDATE puc
    SET
      certificate_number = ?,
      expiry_date = ?
    WHERE id = ?
  `;

  const values = [
    pucData.certificate_number,
    pucData.expiry_date,
    pucId,
  ];

  const [result] = await db.execute(
    query,
    values
  );

  return result;
};

// ======================================================
// GET ALL PUC
// ======================================================

const getAllPuc = async (userId) => {
  const query = `
    SELECT
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

    WHERE v.user_id = ?
  `;

  const [rows] = await db.execute(
    query,
    [userId]
  );

  return rows;
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getPucByVehicleId,
  getPucById,
  addPuc,
  updatePuc,
  updatePucById,
  getAllPuc,
};