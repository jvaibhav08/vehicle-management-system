const db = require("../config/db");

// ======================================================
// GET VEHICLE REPORT DATA
// ======================================================

const getVehicleReportData = async (userId) => {
  // ----------------------------------------------------
  // 1. GET ALL VEHICLES
  // ----------------------------------------------------

  const vehicleQuery = `
    SELECT
      id,
      vehicle_number,
      vehicle_name,
      vehicle_type,
      registration_date,
      rc_status
    FROM vehicles
    WHERE user_id = ?
    ORDER BY vehicle_number ASC
  `;

  // ----------------------------------------------------
  // 2. GET ALL INSURANCE RECORDS
  //    Includes ACTIVE + PREVIOUS
  // ----------------------------------------------------

  const insuranceQuery = `
    SELECT
      i.id,
      i.vehicle_id,
      i.insurance_type,
      i.insurance_company,
      i.policy_number,
      i.expiry_date,
      i.status
    FROM insurance i
    INNER JOIN vehicles v
      ON v.id = i.vehicle_id
    WHERE v.user_id = ?
    ORDER BY
      i.vehicle_id ASC,
      i.status ASC,
      i.expiry_date DESC
  `;

  // ----------------------------------------------------
  // 3. GET ALL PUC RECORDS
  // ----------------------------------------------------

  const pucQuery = `
    SELECT
      p.id,
      p.vehicle_id,
      p.certificate_number,
      p.expiry_date
    FROM puc p
    INNER JOIN vehicles v
      ON v.id = p.vehicle_id
    WHERE v.user_id = ?
    ORDER BY
      p.vehicle_id ASC,
      p.expiry_date DESC
  `;

  // ----------------------------------------------------
  // EXECUTE QUERIES
  // ----------------------------------------------------

  const [
    [vehicles],
    [insurance],
    [puc]
  ] = await Promise.all([
    db.execute(vehicleQuery, [userId]),
    db.execute(insuranceQuery, [userId]),
    db.execute(pucQuery, [userId])
  ]);

  // ----------------------------------------------------
  // RETURN RAW DATA
  // ----------------------------------------------------

  return {
    vehicles,
    insurance,
    puc
  };
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getVehicleReportData
};